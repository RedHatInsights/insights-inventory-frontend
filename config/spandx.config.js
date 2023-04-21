/*global module*/

// Hack so that Mac OSX docker can sub in host.docker.internal instead of localhost
// see https://docs.docker.com/docker-for-mac/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host
const localhost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';

module.exports = {
    routes: {
        '/rhcs/inventory': { host: `http://${localhost}:8002` },
        '/insights/inventory': { host: `http://${localhost}:8002` },
        '/apps/inventory': { host: `http://${localhost}:8002` },
        ...process.env.LOCAL_API?.split(',')?.reduce((acc, curr) => {
            const [appName, appConfig] = curr?.split(':');
            const [appPort = 8003, protocol = 'http'] = appConfig.split('~');
            return {
                ...acc,
                [`/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                [`/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                [`/preview/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                [`/preview/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` }
            };
        }, {})
    }
};
