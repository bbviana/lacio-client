import React, {Component} from 'react';
import {api, reducer} from '../api';
import WordGraph from "./WordGraph";

import './App.css';

class App extends Component {
    state = {
        palavraBusca: "",
        currentNode: null,
        elements: {
            nodes: [],
            edges: [],
            clusters: [], // para o cise layout
        }
    };

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

    fetchDominios = (palavra, page) => {
        api.dominios(palavra, page)
            .then(({data}) => reducer.receiveDominios(this.state, {
                palavra,
                page,
                data
            }))
            .then(newState => this.setState(newState));
    };

    fetchRelacionadas = (dominio, palavra, page) => {
        api.relacionadas(dominio, palavra, page)
            .then(({data}) => reducer.receiveRelacionadas(this.state, {
                palavra,
                dominio,
                page,
                data
            }))
            .then(newState => this.setState(newState));
    };

    render() {
        const {palavraBusca, currentNode, elements} = this.state;

        return (
            <div className="App">
                <Header buscaValue={palavraBusca}
                        onChangeBusca={this.onChangeBusca}
                        onSearch={this.onSearch}/>

                <div className="content">
                    <WordGraph context={currentNode}
                               elements={elements}
                               onClickNode={this.onClickNode}
                    />
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
                       autoFocus
                       onChange={onChangeBusca}
                />
                <input type="submit" value="Buscar"/>
            </form>
        </div>
    )
};


export default App;
