import React, {Component} from 'react';
import axios from 'axios';
import cytoscape from 'cytoscape';
import cise from 'cytoscape-cise';

import './App.css';

cytoscape.use(cise);

class App extends Component {
    state = {
        palavraBusca: "",
        currentNode: null,
        elements: {
            nodes: [],
            edges: [],
            clusters: [],
        }
    };

    onChange = e => {
        this.setState({palavraBusca: e.target.value})
    };

    onSearch = e => {
        e.stopPropagation();
        e.preventDefault();

        const {palavraBusca} = this.state;
        this.setState({
            nodes: [],
            edges: [],
            clusters: [],
        });
        this.fetchDominios(palavraBusca);
    };


    onClickNode = node => {
        const isDominio = node.data('type') === 'dominio';

        if (isDominio) {
            const dominio = node.data("label");
            const palavra = node.data("context");
            this.fetchRelacionadas(dominio, palavra);
        } else { // palavra
            const palavra = node.data("label");
            this.fetchDominios(palavra);
        }
    };

    fetchDominios = palavra => {
        const currentElements = this.state.elements;

        axios
            .get(`/api/dominios/${palavra}`)
            .then(({data}) => {
                const nodes = [].concat({
                    data: {
                        id: palavra,
                        label: palavra,
                        context: palavra,
                        type: 'palavra'
                    }
                }, data.map(it => ({
                    data: {
                        id: it,
                        label: it,
                        context: palavra,
                        type: 'dominio'
                    }
                })));

                console.log(nodes, 'nodes');

                const notContains = element => !currentElements.nodes.find(it => it.data.id === element);

                const edges = data
                    .filter(it => it !== palavra)
                    .filter(notContains)
                    .map(it => ({data: {source: palavra, target: it}}));

                console.log(edges, "edges");

                const cluster = [].concat(palavra, edges.map(it => it.data.target));

                const newElements = Object.assign({}, currentElements, {
                    nodes,
                    edges
                });

                newElements.clusters.push(cluster);

                this.setState({
                    currentNode: palavra,
                    elements: newElements
                });
            });
    };

    fetchRelacionadas = (dominio, palavra) => {
        const currentElements = this.state.elements;
        console.log(currentElements, "currentElements");

        axios
            .get(`/api/relacionadas/${dominio}/${palavra}`)
            .then(({data}) => {
                const nodes = data
                    .concat(palavra)
                    .map(it => ({
                        data: {
                            id: it,
                            label: it,
                            context: dominio,
                            type: 'palavra'
                        }
                    }));

                const notContains = element => !currentElements.nodes.find(it => it.data.id === element);

                const edges = data
                    .filter(it => it !== dominio)
                    .filter(notContains)
                    .map(it => ({data: {source: dominio, target: it}}));

                console.log(edges, "edges");

                const cluster = [].concat(dominio, edges.map(it => it.data.target));

                const newElements = Object.assign({}, currentElements, {
                    nodes,
                    edges
                });

                newElements.clusters.push(cluster);

                this.setState({
                    currentNode: dominio,
                    elements: newElements
                });
            });
    };

    render() {
        const {palavraBusca, currentNode, elements} = this.state;

        return (
            <div className="App">
                <header>Lácio</header>

                <form onSubmit={this.onSearch}>
                    <input type="text"
                           value={palavraBusca}
                           onChange={this.onChange}
                           autoFocus/>
                    <input type="submit" value="Buscar"/>
                </form>

                <Graph context={currentNode}
                       nodes={elements}
                       onClickNode={this.onClickNode}
                />
            </div>
        );
    }
}

// TODO Prop Types
class Graph extends Component {

    constructor(props) {
        super(props);
        this.graph = React.createRef();
    }

    componentDidMount() {
        const {nodes, onClickNode} = this.props;

        console.log(nodes);

        // TODO remover window.cy
        window.cy = this.cy = cytoscape({
            container: this.graph.current,

            elements: nodes,

            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': ele => ele.data('type') === 'dominio' ? 'red' : 'gray',
                        'label': 'data(id)'
                    }
                },

                {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle'
                    }
                }
            ],

            layout: {name: 'null'}

        });

        this.cy.on('tap', 'node', function () {
            onClickNode(this);
        });

        this.cy.on('tap', 'edge', function (e) {
            console.log(e);
        });
    }

    build(context, nodes) {
        console.log(nodes);

        if (!this.cy) return;

        this.cy.add(nodes);

        this.cy.layout({
            name: 'cise',
            animate: false, // true atrapalha a centralização
            clusters: nodes.clusters,
            ready: () => {
                console.log("ready");
                this.cy.fit(this.cy.$(`[context='${context}']`));
            }
        }).run();
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.nodes !== nextProps.nodes;
    }

    render() {
        const {context} = this.props;

        console.log("[Graph] render");

        this.build(context, this.props.nodes);

        return (
            <div className="result" ref={this.graph}/>
        );
    }
}


export default App;
