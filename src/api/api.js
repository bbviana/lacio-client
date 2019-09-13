import axios from 'axios';

const dominios = (palavra, page) => {
    return axios.get(`/api/dominios/${palavra}/${page}`);
};

const relacionadas = (dominio, palavra, page) => {
    return axios.get(`/api/relacionadas/${dominio}/${palavra}/${page}`);
};

const significados = (dominio, palavra) => {
    return axios.get(`/api/significados/${dominio}/${palavra}`);
};

export default {
    dominios,
    relacionadas,
    significados
}