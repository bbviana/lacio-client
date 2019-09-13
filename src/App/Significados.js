import React, {Component} from "react";

class Significados extends Component {

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    componentDidMount() {
        // Evita que o click na própria janela de Significados o feche.
        // Queremos somente que clicks fora dele façam isso.
        this.ref.current.addEventListener('click', e => e.stopPropagation());
    }

    render() {
        const {palavra, dominio, definicoes} = this.props;

        return (
            <div className="Significados" ref={this.ref}>
                <div className="title">Significados</div>
                <div className="subtitle">
                    <span className="highlight">{palavra}</span> dentro do domínio conceitual <span className="highlight">{dominio}</span>
                </div>

                {definicoes.map((it, i) =>
                    <div className="definicao" key={i}>
                        <span className="index">{i + 1}.</span>

                        {it.dominios.length > 0 &&
                        <span className="dominios">{it.dominios.join(", ")}</span>}

                        <span className="texto">{it.texto}</span>

                        {it.score > 0 &&
                        <span className="score">{it.score}</span>}
                    </div>
                )}
            </div>
        )
    }
}

export default Significados;