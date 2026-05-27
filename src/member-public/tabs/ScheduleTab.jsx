import { MILESTONE_IDS, markCompetitionMilestone } from '../services/competitionProgress.js'
import './PlaceholderTab.css'

export function ScheduleTab() {
  const schedulePdfPath = '/training.pdf'

  return (
    <section className="schedule-tab" aria-labelledby="schedule-heading">
      <header className="schedule-tab__head">
        <h2 id="schedule-heading">Schedule</h2>
        <p>Download the training schedule document below.</p>
      </header>

      <div className="schedule-tab__milestones">
        <article className="schedule-tab__milestone">
          <div className="schedule-tab__pdf-meta">
            <p className="schedule-tab__pdf-name">training.pdf</p>
            <p className="schedule-tab__pdf-note">
              Official training material for expo participation.
            </p>
          </div>

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
        </article>
      </div>
    </section>
  )
}
