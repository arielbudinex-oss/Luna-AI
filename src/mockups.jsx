import { Mark } from './fx.jsx';
import { Icon } from './icons.jsx';

export function PcMock() {
  return (
    <div className="pc-mock" aria-hidden="true">
      <div className="pc-bar">
        <span className="pc-brand">
          <Mark size={16} />
          Luna
        </span>
        <span className="pc-phase">siap mendengar</span>
        <span className="pc-dots">
          <i />
          <i />
        </span>
      </div>
      <div className="pc-stage">
        <i className="pc-orb-ring r1" />
        <i className="pc-orb-ring r2" />
        <span className="pc-orb" />
        <span className="pc-caption">LUNA · SIAGA</span>
      </div>
      <div className="pc-chat">
        <div className="bubble me">Luna, atur alarm 6 pagi.</div>
        <div className="bubble luna">
          <Mark size={14} />
          <span>Sudah. Alarm 06.00 dipasang.</span>
        </div>
      </div>
      <div className="pc-input">
        <span>Ketik atau ucapkan…</span>
        <i className="pc-mic">
          <Icon name="mic" size={11} />
        </i>
      </div>
    </div>
  );
}

export function PhoneMock() {
  return (
    <div className="phone-mock" aria-hidden="true">
      <i className="ph-notch" />
      <div className="ph-status">
        <span>21.07</span>
        <span className="ph-sig">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="ph-head">
        <Mark size={20} />
        <div>
          <b>Luna</b>
          <small>
            <i className="ph-dot" />
            terhubung
          </small>
        </div>
        <span className="ph-tag">PC</span>
      </div>
      <div className="ph-chat">
        <div className="ph-bubble luna">Mau aku buka Spotify?</div>
        <div className="ph-bubble me">Ya, yang tenang.</div>
        <div className="ph-bubble luna">Diputar. Volume 30%.</div>
      </div>
      <div className="ph-input">
        <span>Tulis…</span>
        <Icon name="mic" size={11} />
      </div>
      <i className="ph-home" />
    </div>
  );
}
