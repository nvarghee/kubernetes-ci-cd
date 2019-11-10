node {

    checkout scm

    env.DOCKER_API_VERSION="1.23"
    
    sh "git rev-parse --short HEAD > commit-id"

    tag = readFile('commit-id').replace("\n", "").replace("\r", "")
    appName = "hello-kenzan"
    registryHost = "127.0.0.1:30400/"
    imageName = "${registryHost}${appName}:${tag}"
    env.BUILDIMG=imageName
    
    sh "minikube docker-env > env-change.bat"
    bat "env-change.bat"
    sh "docker images"
    bat "SET DOCKER_TLS_VERIFY=1"
    bat "SET DOCKER_HOST=tcp://172.17.157.90:2376"
    bat "SET DOCKER_CERT_PATH=C:\\Users\\nisha\\.minikube\\certs"
    bat "REM @FOR /f \"tokens=*\" %i IN ('minikube docker-env') DO @%i"
    sh "docker images"

    stage "Build"
    
        sh "docker build -t ${imageName} -f applications/hello-kenzan/Dockerfile applications/hello-kenzan"
    
    stage "Push"

        sh "docker push ${imageName}"

    stage "Deploy"

        sh "sed 's#127.0.0.1:30400/hello-kenzan:latest#'$BUILDIMG'#' applications/hello-kenzan/k8s/deployment.yaml | kubectl apply -f -"
        sh "kubectl rollout status deployment/hello-kenzan"
}
