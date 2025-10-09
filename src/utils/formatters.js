/**
 * Formata um ID numérico para exibição com 4 dígitos
 * @param {number} id - O ID a ser formatado
 * @returns {string} - ID formatado (ex: 0001, 0002, 1234)
 */
export const formatId = (id) => {
  if (!id) return '0000';
  return String(id).padStart(4, '0');
};

/**
 * Formata uma data para exibição
 * @param {string|Date} date - A data a ser formatada
 * @returns {string} - Data formatada (ex: 15/01/2024)
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

/**
 * Formata telefone
 * @param {string} phone - O telefone a ser formatado
 * @returns {string} - Telefone formatado (ex: (11) 98765-4321)
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};
