pipeline {

    agent any

    // ── Tool names must match exactly what is registered in:
    //    Jenkins → Manage Jenkins → Global Tool Configuration
    tools {
        maven 'Maven-3.8'   // Register Maven 3.8.7 under this name
        jdk   'JDK-21'      // Register Java 21 under this name
    }

    environment {
        // Local image name only — no registry prefix, no push to DockerHub or any remote
        LOCAL_IMAGE  = "agri-backend:build-${env.BUILD_NUMBER}"
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
        // STAGE 5 — Docker Build (LOCAL ONLY — no push, no registry)
        // Builds the Spring Boot fat JAR into an Alpine JRE image.
        // Image stays on the local Docker daemon only.
        // ════════════════════════════════════════════════════════
        stage('Docker Build') {
            steps {
                echo "==> [Stage 5] Building local Docker image: ${LOCAL_IMAGE}"
                sh """
                    docker build \\
                      -t ${LOCAL_IMAGE} \\
                      -t agri-backend:latest \\
                      ./backend
                """
                // Confirm the image exists locally
                sh "docker image inspect agri-backend:latest --format 'Image size: {{.Size}} bytes'"
            }
        }

        // ════════════════════════════════════════════════════════
        // STAGE 6 — Deploy (LOCAL — docker-compose on this machine)
        // Starts PostgreSQL + Spring Boot containers locally.
        // No external services involved.
        // ════════════════════════════════════════════════════════
        stage('Deploy') {
            steps {
                echo '==> [Stage 6] Deploying full stack locally via docker-compose'
                sh """
                    docker compose -f ${COMPOSE_FILE} down --remove-orphans || true
                    docker compose -f ${COMPOSE_FILE} up -d --build
                """

                echo '==> Waiting for Spring Boot backend to become healthy...'
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
                    echo "Backend did not respond in 3 minutes. Dumping container logs..."
                    docker compose logs backend
                    exit 1
                '''
            }
        }

        // ════════════════════════════════════════════════════════
        // STAGE 7 — Smoke Tests
        // ════════════════════════════════════════════════════════
        stage('Smoke Test') {
            steps {
                echo '==> [Stage 7] Running API smoke tests'
                sh '''
                    echo "--- /api/health ---"
                    curl -sf http://localhost:8080/api/health

                    echo "--- /api/yields ---"
                    YIELDS=$(curl -sf http://localhost:8080/api/yields)
                    echo "Response: $YIELDS"
                    echo "$YIELDS" | python3 -c "import sys,json; data=json.load(sys.stdin); assert isinstance(data,list), 'not a list'; print(f'yields: {len(data)} records')"

                    echo "--- /api/consumption ---"
                    CONS=$(curl -sf http://localhost:8080/api/consumption)
                    echo "$CONS" | python3 -c "import sys,json; data=json.load(sys.stdin); assert isinstance(data,list); print(f'consumption: {len(data)} records')"

                    echo "--- /api/ethanol-targets ---"
                    ETH=$(curl -sf http://localhost:8080/api/ethanol-targets)
                    echo "$ETH" | python3 -c "import sys,json; data=json.load(sys.stdin); assert isinstance(data,list); print(f'ethanol targets: {len(data)} records')"

                    echo "==> All smoke tests PASSED"
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline SUCCESS — Build #${env.BUILD_NUMBER}"
            echo "   Backend running locally at http://localhost:8080"
            echo "   Local image: ${LOCAL_IMAGE}"
        }
        failure {
            echo "❌ Pipeline FAILED — Build #${env.BUILD_NUMBER}. Check stage logs above."
        }
        always {
            cleanWs()
        }
    }
}
