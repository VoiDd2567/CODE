class ContainerManager {
    constructor() {
        this.activeContainers = {};
    }

    /**Add new container into manager. Needs container id and container*/
    add(id, container) { this.activeContainers[id] = container }

    /**Gets container*/
    getContainer(id) { return this.activeContainers[id] }

    /**Deletes container from list */
    delete(id) { delete this.activeContainers[id]; }
}

module.exports = ContainerManager;