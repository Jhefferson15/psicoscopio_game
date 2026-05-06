import ModalWrapper from './ModalWrapper';

const AboutModal = ({ onClose }) => (
  <ModalWrapper title="Sobre o Jogo" onClose={onClose}>
    <div className="about-content">
      <div className="about-section">
        <h3>Psicoscópio v2.0</h3>
        <p>
          Um jogo de tabuleiro educativo projetado para estimular o autoconhecimento 
          e o aprendizado através de desafios e reflexões.
        </p>
      </div>
      
      <div className="about-section">
        <h3>Como Jogar</h3>
        <ul className="tutorial-list">
          <li><div className="bullet">1</div> Jogue o dado para avançar no tabuleiro.</li>
          <li><div className="bullet">2</div> Complete desafios para ganhar pontos.</li>
          <li><div className="bullet">3</div> Reflita sobre as perguntas em cada casa.</li>
        </ul>
      </div>

      <div className="about-footer">
        <p>© 2026 Psicoscópio Team</p>
        <div className="credits">
          Desenvolvido com dedicação para a Jornada do Conhecimento
        </div>
      </div>
    </div>
  </ModalWrapper>
);

export default AboutModal;
