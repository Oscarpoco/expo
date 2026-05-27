import { MILESTONE_IDS, markCompetitionMilestone } from '../services/competitionProgress.js'
import './PlaceholderTab.css'

export function ScheduleTab() {
  const schedulePdfPath = '/training.pdf'

  return (
    <section className="schedule-tab" aria-labelledby="schedule-heading">
      <header className="schedule-tab__head">
        <h2 id="schedule-heading">Schedule</h2>
        <p>Training document is ready to view and download.</p>
      </header>

      <div className="schedule-tab__pdf-card">
        <div className="schedule-tab__pdf-meta">
          <p className="schedule-tab__pdf-name">training.pdf</p>
          <a
            className="primary-btn schedule-tab__download"
            href={schedulePdfPath}
            download="training.pdf"
            aria-label="Download training PDF"
            onClick={() =>
              markCompetitionMilestone(MILESTONE_IDS.downloadTraining)
            }
          >
            Download PDF
          </a>
        </div>

        <div className="schedule-tab__viewer-wrap">
          <iframe
            className="schedule-tab__viewer"
            src={`${schedulePdfPath}#view=FitH`}
            title="Training schedule PDF preview"
          />
        </div>
      </div>
    </section>
  )
}
