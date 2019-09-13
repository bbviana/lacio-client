import React, {Component} from 'react';
import {api, reducer} from '../api';
import Significados from "./Significados";
import WordGraph from "./WordGraph";

import './App.css';

class App extends Component {
    state = {
        palavraBusca: "",
        currentNode: null,
        significado: {
            palavra: "",
            dominio: "",
            definicoes: []
        },
        elements: {
            nodes: [],
            edges: [],
            clusters: [], // para o cise layout
        },
    };

    componentDidMount() {
        // Fecha janela de significados
        document.addEventListener("click", () => this.clearSignificado())
    }

    onChangeBusca = e => {
        this.setState({palavraBusca: e.target.value})
    };

    onSearch = e => {
        e.stopPropagation();
        e.preventDefault();

        const {palavraBusca} = this.state;

        this.fetchDominios(palavraBusca, 1);
    };

    onClickNode = node => {
        const currentPage = node.data("page") || 0;
        const nextPage = currentPage + 1;

        const isPalavra = node.data('type') === 'palavra';
        isPalavra ? this.onClickPalavra(node, nextPage) : this.onClickDominio(node, nextPage)
    };

    onClickPalavra = (node, page) => {
        const palavra = node.data("label");
        this.fetchDominios(palavra, page);
    };

    onClickDominio = (node, page) => {
        const dominio = node.data("label");
        const palavra = node.data("context");
        this.fetchRelacionadas(dominio, palavra, page);
    };

    onClickEdge = edge => {
        const dominio = edge.data("dominio");
        const palavra = edge.data("palavra");
        this.fetchSignificados(dominio, palavra);
    };

    fetchDominios = (palavra, page) => {
        api
            .dominios(palavra, page)
            .then(({data}) => reducer.receiveDominios(this.state, {
                palavra,
                page,
                data,
            }))
            .then(newState => this.setState(newState));
    };

    fetchRelacionadas = (dominio, palavra, page) => {
        api
            .relacionadas(dominio, palavra, page)
            .then(({data}) => reducer.receiveRelacionadas(this.state, {
                palavra,
                dominio,
                page,
                data,
            }))
            .then(newState => this.setState(newState));
    };

    fetchSignificados = (dominio, palavra) => {
        api
            .significados(dominio, palavra)
            .then(({data}) => reducer.receiveSignificados(this.state, {
                palavra,
                dominio,
                data,
            }))
            .then(newState => this.setState(newState));
    };

    clearSignificado = () => this.setState({significado: {}});

    render() {
        const {palavraBusca, currentNode, elements, significado} = this.state;

        return (
            <div className="App">
                <Header buscaValue={palavraBusca}
                        onChangeBusca={this.onChangeBusca}
                        onSearch={this.onSearch}/>

                <div className="content">
                    {significado.palavra &&
                    <Significados palavra={significado.palavra}
                                  dominio={significado.dominio}
                                  definicoes={significado.definicoes}/>}

                    <Subtitle />

                    <WordGraph context={currentNode}
                               elements={elements}
                               onClickNode={this.onClickNode}
                               onClickEdge={this.onClickEdge}/>
                </div>
            </div>
        );
    }
}

const Header = ({buscaValue, onChangeBusca, onSearch}) => {
    return (
        <div className="Header">
            <span className="title">Lácio</span>

            <form onSubmit={onSearch}>
                <input type="text"
                       value={buscaValue}
                       placeholder="Por ex: gato, terra, bóson"
                       autoFocus
                       onChange={onChangeBusca}
                />
                <input type="submit"
                       value="Adicionar"/>
            </form>
        </div>
    )
};

const Subtitle = () => {
    return (
        <div className="Subtitle">
            <div className="palavra">palavra</div>
            <div className="dominio">domínio conceitual</div>
        </div>
    )
};

export default App;
