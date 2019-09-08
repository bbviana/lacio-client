import React, {Component} from 'react';
import axios from 'axios';
import cytoscape from 'cytoscape';
import cise from 'cytoscape-cise';

import './App.css';

cytoscape.use(cise);

class App extends Component {
    state = {
        palavraBusca: "",
        elements: {
            nodes: [],
            edges: [],
            clusters: [],
        }
    };

    onChange = e => {
        this.setState({palavraBusca: e.target.value})
    };

    fetch = palavra => {
        const currentElements = this.state.elements;
        console.log(currentElements, "currentElements");

        axios
            .get(`/api/resumo/${palavra}`)
            .then(({data}) => {
                const nodes = data.relacionadas
                    .map(it => ({data: {id: it, label: it}}));

                const notContains = element => !currentElements.nodes.find(it => it.data.id === element);

                const edges = data.relacionadas
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

                this.setState({elements: newElements});
            });
    };

    render() {
        const {palavraBusca, elements} = this.state;

        return (
            <div className="App">
                <header>Lácio</header>

                <div>
                    <input type="text"
                           value={palavraBusca}
                           onChange={this.onChange}/>
                    <button onClick={e => this.fetch(palavraBusca)}>
                        Buscar
                    </button>
                </div>

                <Graph nodes={elements}/>
            </div>
        );
    }
}

class Graph extends Component {

    constructor(props) {
        super(props);
        this.graph = React.createRef();
    }

    componentDidMount() {
        const {nodes} = this.props;

        console.log(nodes);

        this.cy = cytoscape({
            container: this.graph.current,

            elements: nodes,

            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
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
    }

    build(nodes) {
        console.log(nodes);

        if (!this.cy) return;

        this.cy.add(nodes);

        this.cy.layout({
            name: 'cise',
            animate: true,
            clusters: nodes.clusters,
        }).run();

        const clusterColors = ['#756D76', '#3ac4e1', '#ad277e', '#4139dd', '#d57dba', '#8ab23c', '#8dcaa4'];

        this.cy.style().selector('node').style({
            'background-color': ele => {
                for (let i = 0; i < nodes.clusters.length; i++)
                    if (nodes.clusters[i].includes(ele.data('id')))
                        return clusterColors[i];
                return '#756D76';
            },
        }).update();
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.nodes !== nextProps.nodes;
    }

    render() {
        console.log("[Graph] render");

        this.build(this.props.nodes);

        return (
            <div className="result" ref={this.graph}/>
        );
    }
}


export default App;
