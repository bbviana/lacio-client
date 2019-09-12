const isNotInCollection = currentNodes => node => !currentNodes.find(it => it.id === node.id);

/**
 * Retorna um array contendo os elementos de priorityNodes mais os elementos de otherNodes que não estejam no primeiro
 */
const merge = (priorityNodes, otherNodes) => {
    return [
        ...priorityNodes,
        ...otherNodes.filter(isNotInCollection(priorityNodes))
    ];
};

const receiveDominios = (previousState, action) => {
    const {palavra, page, data} = action;

    if (data.length === 0) {
        return previousState;
    }

    const currentElements = previousState.elements;

    const currentNodes = currentElements.nodes;
    const currentEdges = currentElements.edges;
    const currentClusters = currentElements.clusters;

    const palavraNode = {
        id: `p_${palavra}`,
        label: palavra,
        context: palavra,
        type: 'palavra',
        page: page
    };

    const dominiosNodes = data.map(it => ({
        id: `d_${it}`,
        label: it,
        context: palavra,
        type: 'dominio'
    }));

    const newNodes = dominiosNodes.concat(palavraNode);

    const newEdges = dominiosNodes
        .filter(isNotInCollection(currentNodes))
        .map(it => ({source: palavraNode.id, target: it.id}));

    const newCluster = [].concat(palavraNode.id, newEdges.map(it => it.target));
    const newClusters = [];

    for (const currentCluster of currentClusters) {
        if (currentCluster.indexOf(palavraNode.id) === -1) {
            newClusters.push(currentCluster);
            continue;
        }

        if (page === 1) {
            newClusters.push(newCluster);
            newClusters.push(currentCluster.filter(it => it !== palavraNode.id))
        } else { // page >= 2
            newClusters.push([...currentCluster, ...newCluster]);
        }
    }

    if (currentClusters.length === 0) {
        newClusters.push(newCluster);
    }

    return {
        palavraBusca: "",
        currentNode: palavra,
        elements: {
            nodes: merge(newNodes, currentNodes),
            edges: newEdges.concat(currentEdges),
            clusters: newClusters
        }
    }
};

const receiveRelacionadas = (previousState, action) => {
    const {dominio, palavra, page, data} = action;

    if (data.length === 0) {
        return previousState;
    }

    const currentElements = previousState.elements;

    const currentNodes = currentElements.nodes;
    const currentEdges = currentElements.edges;
    const currentClusters = currentElements.clusters;

    const dominioNode = {
        id: `d_${dominio}`,
        label: dominio,
        context: dominio,
        type: 'dominio',
        page: page
    };

    const palavrasNodes = data
        .concat(palavra)
        .map(it => ({
            id: `p_${it}`,
            label: it,
            context: dominio,
            type: 'palavra'
        }));

    const newNodes = palavrasNodes.concat(dominioNode);

    const newEdges = palavrasNodes
        .filter(isNotInCollection(currentNodes))
        .map(it => ({source: dominioNode.id, target: it.id}));

    const newCluster = [].concat(dominioNode.id, newEdges.map(it => it.target));
    const newClusters = [];

    for (const currentCluster of currentClusters) {
        if (currentCluster.indexOf(dominioNode.id) === -1) {
            newClusters.push(currentCluster);
            continue;
        }

        if (page === 1) {
            newClusters.push(newCluster);
            newClusters.push(currentCluster.filter(it => it !== dominioNode.id))
        } else { // page >= 2
            newClusters.push([...currentCluster, ...newCluster]);
        }
    }

    if (currentClusters.length === 0) {
        newClusters.push(newCluster);
    }

    return {
        currentNode: dominio,
        elements: {
            nodes: merge(newNodes, currentNodes),
            edges: newEdges.concat(currentEdges),
            clusters: newClusters
        }
    };
};

export default {
    receiveDominios,
    receiveRelacionadas
};