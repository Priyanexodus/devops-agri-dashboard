pipeline {

    agent any

    // ── Tool names must match exactly what is registered in:
    //    Jenkins → Manage Jenkins → Global Tool Configuration
    tools {
        maven 'Maven-3.8'   // Register Maven 3.8.7 under this name
        jdk   'JDK-21'      // Register Java 21 under this name
    }

    environment {
        IMAGE_NAME   = 'agri-backend'
        IMAGE_TAG    = "${env.BUILD_NUMBER}"
        BACKEND_DIR  = 'backend/agri-backend'
        COMPOSE_FILE = 'docker-compose.yml'
        MAVEN_OPTS   = '-Xmx512m'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {

        // ════════════════════════════════════════════════════════
        // STAGE 1 — Checkout
        // ════════════════════════════════════════════════════════
        stage('Checkout') {
            steps {
                echo '==> [Stage 1] Checking out source from SCM'
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        // ════════════════════════════════════════════════════════
        // STAGE 2 — Compile
        // ════════════════════════════════════════════════════════
        stage('Compile') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo '==> [Stage 2] Compiling Java 21 source'
                    sh 'mvn clean compile -B --no-transfer-progress'
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // STAGE 3 — Unit Tests (H2 in-memory, no Docker needed)
        // ════════════════════════════════════════════════════════
        stage('Unit Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo '==> [Stage 3] Running JUnit 5 unit tests via Surefire'
                    sh 'mvn test -B --no-transfer-progress'
                }
            }
            post {
                always {
                    junit "${BACKEND_DIR}/target/surefire-reports/*.xml"
                }
                failure {
                    echo '❌ Unit tests failed — aborting pipeline'
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // STAGE 4 — Package (Fat JAR)
        // ════════════════════════════════════════════════════════
        stage('Package') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo '==> [Stage 4] Packaging executable fat JAR'
                    sh 'mvn package -DskipTests -B --no-transfer-progress'
                    archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // STAGE 5 — Docker Build
        // Detects whether Docker is available in WSL2.
        // If not (WSL integration disabled), warns and continues.
        // ════════════════════════════════════════════════════════
        stage('Docker Build') {
            steps {
                script {
                    def rc = sh(script: 'docker info > /dev/null 2>&1', returnStatus: true)
                    if (rc == 0) {
                        echo "==> [Stage 5] Docker available — building image ${IMAGE_NAME}:${IMAGE_TAG}"
                        sh """
                            docker build \\
                              -t ${IMAGE_NAME}:${IMAGE_TAG} \\
                              -t ${IMAGE_NAME}:latest \\
                              ./backend
                        """
                        env.DOCKER_OK = 'true'
                    } else {
                        echo "==> [Stage 5] Docker NOT available in this WSL2 environment."
                        echo "    To fix: Docker Desktop → Settings → Resources → WSL Integration → enable your distro."
                        echo "    Continuing to Stage 6 — will deploy fat JAR directly instead."
                        env.DOCKER_OK = 'false'
                    }
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // STAGE 6 — Deploy
        //   Path A (Docker OK):   docker-compose up
        //   Path B (No Docker):   verify Postgres reachable +
        //                         launch fat JAR via java -jar
        // ════════════════════════════════════════════════════════
        stage('Deploy') {
            steps {
                script {
                    if (env.DOCKER_OK == 'true') {
                        echo '==> [Stage 6 / Path A] Deploying via docker-compose'
                        sh """
                            docker compose -f ${COMPOSE_FILE} down --remove-orphans || true
                            docker compose -f ${COMPOSE_FILE} up -d --build
                        """
                    } else {
                        echo '==> [Stage 6 / Path B] No Docker — deploying fat JAR directly'

                        sh '''
                            echo "Checking PostgreSQL on localhost:5432..."
                            for i in $(seq 1 6); do
                                if pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
                                    echo "PostgreSQL is ready."
                                    break
                                fi
                                echo "Attempt $i/6 — waiting 5s..."
                                sleep 5
                            done
                        '''

                        sh '''
                            OLD=$(lsof -ti:8080 2>/dev/null || true)
                            if [ -n "$OLD" ]; then
                                echo "Stopping old process on :8080 (PID $OLD)"
                                kill -9 $OLD || true
                                sleep 2
                            fi
                        '''

                        sh """
                            JAR=\$(ls ${BACKEND_DIR}/target/agri-backend-*.jar | grep -v '.original' | head -1)
                            echo "Starting: \$JAR"
                            nohup java \\
                              -DPOSTGRES_HOST=localhost \\
                              -DPOSTGRES_DB=agri_db \\
                              -DPOSTGRES_USER=postgres \\
                              -DPOSTGRES_PASSWORD=postgres \\
                              -Djava.security.egd=file:/dev/./urandom \\
                              -jar \$JAR > /tmp/agri-backend.log 2>&1 &
                            echo \$! > /tmp/agri-backend.pid
                            echo "PID: \$(cat /tmp/agri-backend.pid)"
                        """
                    }
                }

                echo '==> Waiting for Spring Boot to become healthy...'
                sh '''
                    for i in $(seq 1 18); do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health 2>/dev/null || echo "000")
                        if [ "$STATUS" = "200" ]; then
                            echo "Backend UP (HTTP 200) after attempt $i"
                            exit 0
                        fi
                        echo "Attempt $i/18 — status=$STATUS — waiting 10s..."
                        sleep 10
                    done
                    echo "Backend did not become healthy. Dumping log..."
                    cat /tmp/agri-backend.log 2>/dev/null || true
                    exit 1
                '''
            }
        }

        // ════════════════════════════════════════════════════════
        // STAGE 7 — Smoke Tests (same for both Deploy paths)
        // ════════════════════════════════════════════════════════
        stage('Smoke Test') {
            steps {
                echo '==> [Stage 7] Running API smoke tests'
                sh '''
                    echo "--- /api/health ---"
                    curl -sf http://localhost:8080/api/health

                    echo "--- /api/yields ---"
                    YIELDS=$(curl -sf http://localhost:8080/api/yields)
                    echo "$YIELDS" | python3 -c "import sys,json; d=json.load(sys.stdin); assert isinstance(d,list); print(f'yields: {len(d)} records')"

                    echo "--- /api/consumption ---"
                    CONS=$(curl -sf http://localhost:8080/api/consumption)
                    echo "$CONS" | python3 -c "import sys,json; d=json.load(sys.stdin); assert isinstance(d,list); print(f'consumption: {len(d)} records')"

                    echo "--- /api/ethanol-targets ---"
                    ETH=$(curl -sf http://localhost:8080/api/ethanol-targets)
                    echo "$ETH" | python3 -c "import sys,json; d=json.load(sys.stdin); assert isinstance(d,list); print(f'ethanol targets: {len(d)} records')"

                    echo "==> All smoke tests PASSED"
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline SUCCESS — Build #${env.BUILD_NUMBER} deployed at http://localhost:8080"
        }
        failure {
            echo "❌ Pipeline FAILED — Build #${env.BUILD_NUMBER}. Check stage logs above."
        }
        always {
            cleanWs()
        }
    }
}
