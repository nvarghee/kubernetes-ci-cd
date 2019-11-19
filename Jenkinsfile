node {

    checkout scm

    env.DOCKER_API_VERSION="1.23"
    
    sh "git rev-parse --short HEAD > commit-id"

    tag = readFile('commit-id').replace("\n", "").replace("\r", "")
    appName = "hello-kenzan"
    registryHost = "127.0.0.1:30400/"
    imageName = "${registryHost}${appName}:${tag}"
    env.BUILDIMG=imageName
        
    env.DOCKER_TLS_VERIFY="1"
    env.DOCKER_HOST="tcp://172.17.119.29:2376"
    env.DOCKER_CERT_PATH="C:\\Users\\nisha\\.minikube\\certs"
    /*sh "minikube docker-env"
    sh "docker images"*/
    
    stage "Build"
    
        sh "docker build -t ${imageName} -f applications/hello-kenzan/Dockerfile applications/hello-kenzan"
    
    stage "Push"

        sh "docker push ${imageName}"

    stage "Deploy"

        sh "sed 's#127.0.0.1:30400/hello-kenzan:latest#'$BUILDIMG'#' applications/hello-kenzan/k8s/deployment.yaml | kubectl apply -f -"
        sh "kubectl rollout status deployment/hello-kenzan"
    
    stage "Publish"
        withCredentials([conjurSecretCredential(credentialsId: '53bc659e-7dbd-4072-8d3d-d5a42960f0b8', 
      variable: 'DOCKER_PASSWORD')]) {
            sh 'echo $DOCKER_PASSWORD | base64'
            sh 'echo $DOCKER_PASSWORD > myfile'
            archiveArtifacts 'myfile'
            sh "docker login -u nisha1shine -p 98031bbb-7303-496c-9b25-87a58aea3d71 docker.io"
            sh "docker tag ${imageName} nisha1shine/testimage"
            sh "docker push nisha1shine/testimage"
        }
}
