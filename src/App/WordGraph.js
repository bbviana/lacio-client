import React, {Component} from 'react';
import cise from 'cytoscape-cise';
import cytoscape from 'cytoscape';

// registra layout
cytoscape.use(cise);

class WordGraph extends Component {

    constructor(props) {
        super(props);
        this.graph = React.createRef();
    }

    componentDidMount() {
        const {onClickNode} = this.props;

        this.cy = cytoscape({
            container: this.graph.current,
            elements: [],
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': ele => ele.data('type') === 'dominio' ? '#CCC' : 'green',
                        'label': 'data(label)'
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
            ]
        });

        this.cy.on('tap', 'node', function () {
            onClickNode(this);
        });

        this.cy.on('tap', 'edge', function (e) {
            console.log(e);
        });
    }

    draw(context, elements) {
        if (!this.cy) return;

        const formattedElements = toCytoscapeFormat(elements);

        // removemos nós anteriores, pois podemos ter alterado alguma meta informação deles e queremos sobrescrever
        this.cy.remove('node');
        this.cy.add(formattedElements);

        this.cy.layout({
            name: 'cise',
            // animate: 'end', // true atrapalha cy.fit()
            fit: false,
            // allowNodesInsideCircle: true,
            nodeRepulsion: 1,
            clusters: formattedElements.clusters, // clusters são os grupos do cise layout: os círculos
            ready: () => {
                // faz o viewport exibir os nodes do contexto atual, i.e, a íltima palavra escolhida
                this.cy.fit(this.cy.$(`[context='${context}']`));
            }
        }).run();
    }


    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.elements !== nextProps.elements;
    }

    render() {
        const {context, elements} = this.props;

        // FIXME usar um callback adequado
        this.draw(context, elements);

        return (
            <div className="WordGraph" ref={this.graph}/>
        );
    }
}

const toCytoscapeFormat = ({nodes, edges, clusters}) => ({
    nodes: nodes.map(it => ({data: it})),
    edges: edges.map(it => ({data: it})),
    clusters,
});


export default WordGraph;