import { useState } from 'react';
import { X, Clock, Video, Check } from 'lucide-react';

interface AdvisorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdvisorModal({ open, onClose }: AdvisorModalProps) {
  const [selectedDay, setSelectedDay] = useState('Domani, 15:30');
  const [name, setName] = useState('Aky');
  const [email, setEmail] = useState('bellosi2022@gmail.com');
  const [booked, setBooked] = useState(false);

  if (!open) return null;

  const handleBooking = () => {
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-slate-800 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Consulente Senior"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Prenota Consulenza Gratuita</h3>
              <p className="text-xs text-slate-500">Con Andrea M., Solution Architect Senior</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-5 text-xs text-slate-600">
          <p className="leading-relaxed">
            Una sessione individuale di 25 minuti via Google Meet per definire la strategia del tuo progetto, revisionare il design di CasaLavoroPRO e scoprire le migliori integrazioni per la tua azienda.
          </p>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Scegli orario disponibile:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Domani, 11:00',
                'Domani, 15:30',
                'Giovedì, 10:00',
                'Giovedì, 16:45',
              ].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedDay(slot)}
                  className={`p-2 rounded-lg border text-left font-medium transition-colors flex items-center gap-1.5 ${
                    selectedDay === slot
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{slot}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Email di conferma</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBooking}
          disabled={booked}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
        >
          {booked ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Appuntamento confermato su Google Meet!</span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4 text-blue-400" />
              <span>Conferma Appuntamento Gratuito</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
