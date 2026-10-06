import { reasons } from '../data.js'

export default function WhyUs() {
  return (
    <section id="why" className="section section--dark">
      <div className="container" data-reveal>
        <div className="why-head">
          <div>
            <div className="eyebrow eyebrow--light">The SkyLine difference</div>
            <h2 className="h2">Why clients across Vancouver choose us</h2>
            <p className="why-head__lead">
              Meet the crew behind every SkyLine ceiling — from the first
              measurement to the final LED line.
            </p>
          </div>

          <figure className="team-card">
            <img
              src="/assets/team.jpg"
              alt="The SkyLine Ceilings installation team"
              className="team-card__img"
              loading="lazy"
            />
          </figure>
        </div>

        <div className="reason-grid">
          {reasons.map((r) => (
            <div key={r.title} className="lift reason">
              <span className="reason__mark" />
              <h3 className="reason__title">{r.title}</h3>
              <p className="reason__text">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
