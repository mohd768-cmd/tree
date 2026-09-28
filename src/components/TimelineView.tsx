import React, { useState } from 'react';
import { TimelineMilestone } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TimelineViewProps {
  milestones: TimelineMilestone[];
  onAddMilestoneMemory: (memory: {
    title: string;
    year: number;
    generation: string;
    narrative: string;
  }) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  milestones,
  onAddMilestoneMemory,
}) => {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({
    'note-1898': false,
  });
  const [candleCount, setCandleCount] = useState<number>(() => {
    const saved = localStorage.getItem('family_candles_v1');
    return saved ? parseInt(saved, 10) : 138;
  });
  const [hasLitCandle, setHasLitCandle] = useState<boolean>(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState<boolean>(false);

  // Contribution Form State
  const [contributeTitle, setContributeTitle] = useState('');
  const [contributeYear, setContributeYear] = useState('1935');
  const [contributeGen, setContributeGen] = useState('Generation 3 (1955-1989)');
  const [contributeNarrative, setContributeNarrative] = useState('');
  const [submittedToast, setSubmittedToast] = useState<string | null>(null);

  const handleLightCandle = () => {
    if (hasLitCandle) return;
    const newCount = candleCount + 1;
    setCandleCount(newCount);
    setHasLitCandle(true);
    localStorage.setItem('family_candles_v1', newCount.toString());
  };

  const handleToggleNote = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMilestones = milestones.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.category.includes(activeFilter);
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMilestoneMemory({
      title: contributeTitle,
      year: parseInt(contributeYear, 10) || 1935,
      generation: contributeGen,
      narrative: contributeNarrative,
    });
    setIsContributeModalOpen(false);
    setContributeTitle('');
    setContributeNarrative('');
    setSubmittedToast('Your memory was verified and added to the Family Historical Chronicle!');
    setTimeout(() => setSubmittedToast(null), 4000);
  };

  return (
    <div className="flex flex-col w-full pb-28 max-w-4xl mx-auto">
      {/* Archival Story Header */}
      <section className="px-4 md:px-6 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#ffdeaa] text-[#271900] text-[10px] font-bold uppercase tracking-wider">
            Historical Chronicle
          </span>
          <span className="text-xs text-[#424844]">4 Generations • 126 Years</span>
        </div>

        <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-[#0d2419] font-bold tracking-tight">
          The Aayinikunnathth Maayan Kutty &amp; Paathu Family Journey
        </h1>

        <p className="text-xs sm:text-sm text-[#424844] leading-relaxed max-w-2xl">
          From the ancestral homestead to the eight branches of children and grandchildren. A
          verified tapestry of heritage, unity, and generational blessings.
        </p>

        {/* Quick Stats Bento Strip */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-[#f2ede3] rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs border border-[#e7e2d8]">
            <span className="font-display text-lg sm:text-xl font-bold text-[#0d2419]">1928</span>
            <span className="text-[10px] text-[#424844] uppercase tracking-wide font-semibold">
              Genesis
            </span>
          </div>
          <div className="bg-[#f2ede3] rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs border border-[#e7e2d8]">
            <span className="font-display text-lg sm:text-xl font-bold text-[#7b5810]">8</span>
            <span className="text-[10px] text-[#424844] uppercase tracking-wide font-semibold">
              Children
            </span>
          </div>
          <div className="bg-[#f2ede3] rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs border border-[#e7e2d8]">
            <span className="font-display text-lg sm:text-xl font-bold text-[#0d2419]">100%</span>
            <span className="text-[10px] text-[#424844] uppercase tracking-wide font-semibold">
              Heritage
            </span>
          </div>
        </div>
      </section>

      {/* Filter Chips Scrolling Rail */}
      <section className="w-full overflow-x-auto py-2 px-4 md:px-6 flex items-center gap-2 no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeFilter === 'all'
              ? 'bg-[#0d2419] text-white shadow-xs'
              : 'bg-[#ede8de] text-[#1d1c16] hover:bg-[#ffdeaa]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">auto_stories</span>
          <span>All Milestones</span>
        </button>

        <button
          onClick={() => setActiveFilter('births')}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeFilter === 'births'
              ? 'bg-[#0d2419] text-white shadow-xs'
              : 'bg-[#ede8de] text-[#1d1c16] hover:bg-[#ffdeaa]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">favorite</span>
          <span>Births &amp; Marriages</span>
        </button>

        <button
          onClick={() => setActiveFilter('photos')}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeFilter === 'photos'
              ? 'bg-[#0d2419] text-white shadow-xs'
              : 'bg-[#ede8de] text-[#1d1c16] hover:bg-[#ffdeaa]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">photo_camera_front</span>
          <span>Historical Photos</span>
        </button>

        <button
          onClick={() => setActiveFilter('relocation')}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeFilter === 'relocation'
              ? 'bg-[#0d2419] text-white shadow-xs'
              : 'bg-[#ede8de] text-[#1d1c16] hover:bg-[#ffdeaa]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">explore</span>
          <span>Immigration &amp; Relocation</span>
        </button>
      </section>

      {/* Confirmation Toast */}
      {submittedToast && (
        <div className="mx-4 md:px-6 my-2 p-3 bg-[#cee9d7] text-[#082015] rounded-xl text-xs font-semibold flex items-center gap-2 border border-[#8aa494] shadow-sm animate-fade-in">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{submittedToast}</span>
        </div>
      )}

      {/* Archival Vertical Timeline */}
      <section className="relative px-4 md:px-6 py-4 flex flex-col gap-6">
        {/* Continuous Gilded Spine Line */}
        <div className="absolute left-[31px] md:left-[39px] top-6 bottom-8 w-[2px] bg-[#eebf6f] pointer-events-none"></div>

        {filteredMilestones.map((milestone) => (
          <div key={milestone.id} className="relative flex gap-3 sm:gap-4 items-start">
            {/* Icon Marker */}
            <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-[#fdcd7b] text-[#78550d] flex items-center justify-center shadow-md border border-[#7b5810]/30">
              {milestone.category.includes('births') ? (
                <span className="material-symbols-outlined text-[18px]">child_friendly</span>
              ) : milestone.category.includes('relocation') ? (
                <span className="material-symbols-outlined text-[18px]">sailing</span>
              ) : milestone.isCandleTribute ? (
                <span className="material-symbols-outlined text-[18px]">candle</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">hub</span>
              )}
            </div>

            {/* Content Card */}
            <div className="flex-grow flex flex-col bg-white rounded-xl p-4 shadow-xs border border-[#e7e2d8]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-lg font-bold text-[#7b5810]">
                  {milestone.year}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ede3] text-[#424844] font-semibold">
                  {milestone.generationTag}
                </span>
              </div>

              <h2 className="font-semibold text-sm sm:text-base text-[#0d2419] mt-0.5">
                {milestone.title}
              </h2>

              <div className="flex items-center gap-1 text-[#424844] text-xs mt-0.5">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>{milestone.location}</span>
              </div>

              {/* Archival Image Preview */}
              {milestone.imageUrl && (
                <div className="mt-2.5 overflow-hidden rounded-lg bg-[#f2ede3] relative border border-[#e7e2d8]">
                  <img
                    src={milestone.imageUrl}
                    alt={milestone.title}
                    className="w-full h-44 object-cover object-center"
                  />
                  {milestone.imageCaption && (
                    <div className="absolute bottom-2 left-2 bg-[#1d1c16]/85 backdrop-blur-sm px-2.5 py-1 rounded text-white text-[10px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      <span>{milestone.imageCaption}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Passenger Manifest Box (for 1948) */}
              {milestone.passengerManifest && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-[#ede8de] flex flex-col gap-1 border border-[#c2c8c2]/50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0d2419]">
                      Passenger Ledger
                    </span>
                    <span className="text-[10px] text-[#424844]">
                      {milestone.passengerManifest.folio}
                    </span>
                  </div>
                  <div className="space-y-1 pt-1 font-mono text-[11px]">
                    {milestone.passengerManifest.passengers.map((p, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[#c2c8c2]/20 pb-0.5">
                        <span>
                          {p.name} ({p.age})
                        </span>
                        <span className="text-[#424844]">{p.occupation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrative Description */}
              <p className="text-xs sm:text-sm text-[#1d1c16] mt-2 leading-relaxed">
                {milestone.description}
              </p>

              {/* Memorial Candle Tribute Box (for 1984) */}
              {milestone.isCandleTribute && (
                <div className="mt-3 p-3 rounded-xl bg-[#f2ede3] flex flex-col gap-2 border border-[#e7e2d8]">
                  <p className="font-display italic text-xs sm:text-sm text-[#0d2419]">
                    “He fashioned life like oak: patiently shaped, resilient against tempests,
                    leaving shade for children he would never see.”
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#424844] font-medium">
                      {candleCount} Candles Lit
                    </span>
                    <button
                      onClick={handleLightCandle}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                        hasLitCandle
                          ? 'bg-[#7b5810] text-white'
                          : 'bg-[#fdcd7b] text-[#78550d] hover:bg-[#ffdeaa]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">mode_heat</span>
                      <span>{hasLitCandle ? 'Candle Lit 🕯️' : 'Light a Candle'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Trade or Quote Notes */}
              {milestone.tradeTag && (
                <div className="mt-2.5 pt-1.5 border-t border-[#f2ede3] flex items-center justify-between text-xs text-[#424844]">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="material-symbols-outlined text-[15px] text-[#7b5810]">
                      workspace_premium
                    </span>
                    <span>{milestone.tradeTag}</span>
                  </span>
                  <button
                    onClick={() => handleToggleNote('note-1898')}
                    className="text-[#0d2419] font-bold hover:underline flex items-center gap-0.5 text-xs"
                  >
                    <span>Inspect</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              )}

              {expandedNotes['note-1898'] && milestone.quote && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#f8f3e9] text-[#424844] text-[11px] leading-normal border border-[#e7e2d8]">
                  {milestone.quote}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Preserve a Montgomery Memory Trigger */}
      <section className="px-4 md:px-6 pt-2 pb-6 flex flex-col gap-3">
        <div className="p-4 rounded-2xl bg-[#f2ede3] flex flex-col gap-3 shadow-xs border border-[#e7e2d8]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffdeaa] text-[#271900] flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">post_add</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-semibold text-sm text-[#0d2419]">
                Preserve a Family Memory
              </h3>
              <p className="text-xs text-[#424844] mt-0.5 leading-relaxed">
                Have a letter, tintype photo, or heirloom anecdote? Add your chapter to the archival
                registry.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsContributeModalOpen(true)}
            className="w-full py-3 rounded-xl bg-[#0d2419] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:bg-[#233a2e] transition-colors active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
            <span>Contribute Memory or Document</span>
          </button>
        </div>
      </section>

      {/* Add Memory Archival Modal Sheet */}
      {isContributeModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1c16]/60 backdrop-blur-sm flex flex-col justify-end p-4 pb-safe animate-fade-in">
          <div className="w-full bg-[#fef9ef] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-2xl max-w-lg mx-auto max-h-[85vh] overflow-y-auto border border-[#e7e2d8]">
            <div className="flex items-center justify-between pb-1 border-b border-[#e7e2d8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7b5810] text-[22px]">
                  bookmark_add
                </span>
                <span className="font-display font-bold text-base text-[#0d2419]">
                  Archival Submission
                </span>
              </div>
              <button
                onClick={() => setIsContributeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2ede3] flex items-center justify-center text-[#424844] hover:bg-[#ede8de]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#424844]">
              Submissions undergo lineage verification and high-resolution restoration before entry
              into the official ledger.
            </p>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#0d2419]">
                  Milestone / Story Title
                </label>
                <input
                  type="text"
                  required
                  value={contributeTitle}
                  onChange={(e) => setContributeTitle(e.target.value)}
                  placeholder="e.g. Great-Aunt Clara's Violin Recital, 1934"
                  className="px-3 py-2 rounded-lg bg-white border border-[#e7e2d8] text-xs text-[#1d1c16] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#0d2419]">Approx. Year</label>
                  <input
                    type="number"
                    min="1850"
                    max="2026"
                    required
                    value={contributeYear}
                    onChange={(e) => setContributeYear(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#e7e2d8] text-xs text-[#1d1c16] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#0d2419]">Generation</label>
                  <select
                    value={contributeGen}
                    onChange={(e) => setContributeGen(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#e7e2d8] text-xs text-[#1d1c16] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
                  >
                    <option>Generation 1 (1898-1925)</option>
                    <option>Generation 2 (1926-1954)</option>
                    <option>Generation 3 (1955-1989)</option>
                    <option>Generation 4 (1990-Today)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#0d2419]">Narrative Record</label>
                <textarea
                  rows={3}
                  required
                  value={contributeNarrative}
                  onChange={(e) => setContributeNarrative(e.target.value)}
                  placeholder="Describe the moment, setting, relatives present, and surviving artifacts..."
                  className="px-3 py-2 rounded-lg bg-white border border-[#e7e2d8] text-xs text-[#1d1c16] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
                ></textarea>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#0d2419]">
                  Document or Photo Attachment
                </label>
                <div className="p-4 rounded-lg bg-[#f2ede3] border border-dashed border-[#7b5810]/40 flex flex-col items-center justify-center text-center gap-1 cursor-pointer hover:bg-[#ede8de] transition-colors">
                  <span className="material-symbols-outlined text-[28px] text-[#7b5810]">
                    cloud_upload
                  </span>
                  <span className="text-xs font-semibold text-[#0d2419]">
                    Photo attached from archive library
                  </span>
                  <span className="text-[10px] text-[#424844]">
                    PNG, JPG, TIFF or PDF up to 25MB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#f2ede3] text-[#1d1c16] text-xs font-semibold uppercase tracking-wider hover:bg-[#ede8de]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#0d2419] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-[#233a2e]"
                >
                  Submit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
