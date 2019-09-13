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

    const newNodes = dominiosNodes
        .filter(isNotInCollection(currentNodes));

    const newEdges = newNodes
        .map(it => ({
            source: palavraNode.id,
            target: it.id,
            palavra: palavraNode.label,
            dominio: it.label,
        }));

    newNodes.push(palavraNode);

    const newCluster = [].concat(palavraNode.id, newEdges.map(it => it.target));
    let newClusterAdded = false;
    const newClusters = [];

    for (const currentCluster of currentClusters) {
        // cluster que não tem a palavra: mantém na lista de clusters
        const isOnCurrentCluster = currentCluster.indexOf(palavraNode.id) !== -1;
        if (!isOnCurrentCluster) {
            newClusters.push(currentCluster);
        }

        // remove palavra do cluster atual e coloca em um novo
        if (isOnCurrentCluster && page === 1) {
            newClusters.push(newCluster);
            newClusterAdded = true;
            newClusters.push(currentCluster.filter(it => it !== palavraNode.id))
        }

        // adiciona ao cluster que ja tem a palavra
        if (isOnCurrentCluster && page >= 2) {
            newClusters.push([...currentCluster, ...newCluster]);
            newClusterAdded = true;
        }
    }

    !newClusterAdded && newClusters.push(newCluster);

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

    // FIXME trecho praticamente idêntico a receiveDominios: encapuslar
    const newNodes = palavrasNodes
        .filter(isNotInCollection(currentNodes));

    const newEdges = newNodes
        .map(it => ({
            source: dominioNode.id,
            target: it.id,
            palavra: it.label,
            dominio: dominioNode.label,
        }));

    newNodes.push(dominioNode);

    const newCluster = [].concat(dominioNode.id, newEdges.map(it => it.target));
    let newClusterAdded = false;
    const newClusters = [];

    for (const currentCluster of currentClusters) {
        // cluster que não tem a palavra: mantém na lista de clusters
        const isOnCurrentCluster = currentCluster.indexOf(dominioNode.id) !== -1;
        if (!isOnCurrentCluster) {
            newClusters.push(currentCluster);
        }

        // remove palavra do cluster atual e coloca em um novo
        if (isOnCurrentCluster && page === 1) {
            newClusters.push(newCluster);
            newClusterAdded = true;
            newClusters.push(currentCluster.filter(it => it !== dominioNode.id))
        }

        // adiciona ao cluster que ja tem a palavra
        if (isOnCurrentCluster && page >= 2) {
            newClusters.push([...currentCluster, ...newCluster]);
            newClusterAdded = true;
        }
    }

    !newClusterAdded && newClusters.push(newCluster);

    return {
        currentNode: dominio,
        elements: {
            nodes: merge(newNodes, currentNodes),
            edges: newEdges.concat(currentEdges),
            clusters: newClusters
        }
    };
};

const receiveSignificados = (previousState, action) => {
    const {palavra, dominio, data} = action;

    console.log(data, "receiveSignificados");

    return {
        significado: {
            palavra,
            dominio,
            definicoes: data
        }
    }

};

export default {
    receiveDominios,
    receiveRelacionadas,
    receiveSignificados
};