class ContainerManager {
    constructor() {
        this.activeContainers = {};
    }

    add(id, container) { this.activeContainers[id] = container }

    getContainer(id) { return this.activeContainers[id] }

    delete(id) { delete this.activeContainers[id]; }
}

module.exports = ContainerManager;