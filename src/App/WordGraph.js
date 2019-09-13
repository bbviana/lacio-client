import React, {Component} from 'react';
import cise from 'cytoscape-cise';
import cytoscape from 'cytoscape';

// registra layout
cytoscape.use(cise);

/**
 * O cytoscape não foi implementado sob a filosofia declarativa.
 * Sua abordagem imperativa gera algumas dificuldades quando integramos com o React.
 * Esta classe é um wrapper para esconder essa integração meio "deselegante".
 *
 * Até tentei usar um wrapper já pronto, https://github.com/plotly/react-cytoscapejs,
 * mas tinha muitos bugs e não quis perder tempo.
 */
class WordGraph extends Component {

    constructor(props) {
        super(props);
        this.graph = React.createRef();
    }

    componentDidMount() {
        const {onClickNode, onClickEdge} = this.props;

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
                        'line-color': '#ccc'
                    }
                }
            ]
        });

        this.cy.on('tap', 'node', function () {
            onClickNode(this);
        });

        this.cy.on('tap', 'edge', function (e) {
            console.log(e.renderedPosition);
            onClickEdge(this);
        });
    }

    draw(context, elements) {
        if (!this.cy) return;

        const formattedElements = toCytoscapeFormat(elements);

        console.log(formattedElements.nodes, "nodes");
        console.log(formattedElements.clusters, "clusters");

        // removemos nós anteriores, pois podemos ter alterado alguma meta informação deles e queremos sobrescrever
        this.cy.remove('node');
        this.cy.add(formattedElements);

        this.cy.layout({
            name: 'cise',
            // animate: 'end', // não funcionou bem com o cy.fit() do ready
            fit: false,
            nodeRepulsion: 5,
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