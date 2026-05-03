/**
 * Use Case para salvar a avaliação da experiência do usuário (MEEGA+).
 * Segue os princípios da Clean Architecture isolando a lógica de negócio.
 */
export class SaveEvaluationUseCase {
  /**
   * Executa o salvamento da avaliação.
   * 
   * @param {Object} repository - Instância do repositório que implementa GameSyncRepository.
   * @param {Object} evaluationData - Dados da avaliação a serem salvos.
   * @returns {Promise<void>}
   */
  static async execute(repository, evaluationData) {
    if (!evaluationData) {
      throw new Error('Dados da avaliação são obrigatórios');
    }

    if (!evaluationData.answers || Object.keys(evaluationData.answers).length === 0) {
      throw new Error('As respostas da avaliação não podem estar vazias');
    }

    // Adiciona metadados se não existirem
    const enrichedData = {
      ...evaluationData,
      timestamp: evaluationData.timestamp || Date.now(),
      platform: 'web-mobile'
    };

    return await repository.saveEvaluation(enrichedData);
  }
}
