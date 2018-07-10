node {
    env.NODEJS_HOME = "${tool 'node-10'}"
    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"

    checkout scm

    sh 'git rev-parse HEAD'

    stage('build') {
        sh 'npm ci'
    }

    stage('verify') {
        sh 'npm run verify'
    }
}
