import axios from 'axios';

const dominios = (palavra, page) => {
    return axios.get(`/api/dominios/${palavra}/${page}`);
};

const relacionadas = (dominio, palavra, page) => {
    return axios.get(`/api/relacionadas/${dominio}/${palavra}/${page}`);
};

export default {
    dominios,
    relacionadas
}