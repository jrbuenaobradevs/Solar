import { type PageSection } from "../../lib/cms"
import Icon from "../Icon"
import SolarPackageCard from "../SolarPackageCard"
import SolarAddonCard from "../SolarAddonCard"
import SectionTitle from "../SectionTitle"
import type { SolarAddon } from "../../lib/cms"

/**
 * Renders a page section based on its section_type.
 * Each section_type maps to a specific rendering component.
 */
export default function PageSectionRenderer({
  section,
}: {
  section: PageSection
}) {
  if (!section.is_visible) return null

  const { section_type, title, content, layout, settings } = section

  // Map section types to render functions
  const renderers: Record<string, React.ReactElement | null> = {
    hero: <HeroSection section={section} />,
    offer: <OfferSection section={section} />,
    why: <WhySection section={section} />,
    types: <TypesSection section={section} />,
    who: <WhoSection section={section} />,
    packages: <PackagesSection section={section} />,
    addons: <AddonsSection section={section} />,
    steps: <StepsSection section={section} />,
    features: <FeaturesSection section={section} />,
    stats: <StatsSection section={section} />,
    testimonials: <TestimonialsSection section={section} />,
    cta: <CTASection section={section} />,
    text: <TextSection section={section} />,
    richtext: <RichTextSection section={section} />,
    image: <ImageSection section={section} />,
    gallery: <GallerySection section={section} />,
    video: <VideoSection section={section} />,
    faq: <FAQSectionRenderer section={section} />,
    form: <FormSection section={section} />,
    calculator: <CalculatorSection section={section} />,
    quote_form: <QuoteFormSection section={section} />,
    contact: <ContactSection section={section} />,
    map: <MapSection section={section} />,
    social: <SocialSection section={section} />,
    newsletter: <NewsletterSection section={section} />,
    breadcrumb: <BreadcrumbSection section={section} />,
  }

  const Renderer = renderers[section_type] || (
    <GenericSection section={section} />
  )
  return Renderer
}

// Section Renderers

function HeroSection({ section }: { section: PageSection }) {
  const { title, content, layout, settings } = section
  const backgroundImage = content.background_image || settings.background_image
  const eyebrow = content.eyebrow || settings.eyebrow
  const ctaPrimary = content.cta_primary || settings.cta_primary
  const ctaSecondary = content.cta_secondary || settings.cta_secondary

  return (
    <section
      className={`hero-section ${layout}`}
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : undefined
      }
    >
      <div className="shell hero-grid">
        <div className="hero-copy">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {content.body && <p>{content.body}</p>}
          <div className="action-row">
            {ctaPrimary && (
              <a href={ctaPrimary.url} className="btn btn-primary">
                {ctaPrimary.label}
              </a>
            )}
            {ctaSecondary && (
              <a href={ctaSecondary.url} className="btn btn-secondary">
                {ctaSecondary.label}
              </a>
            )}
          </div>
          {content.benefits && (
            <div className="benefit-strip">
              {content.benefits.map((benefit: string, i: number) => (
                <span key={i}>{benefit}</span>
              ))}
            </div>
          )}
        </div>
        {content.media && (
          <div className="hero-media">
            <img src={content.media.url} alt={content.media.alt || title} />
            {content.media.caption && (
              <span className="demo-photo">{content.media.caption}</span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function OfferSection({ section }: { section: PageSection }) {
  const { title, content, layout } = section
  const items = content.items || []

  return (
    <section className={`section offer-section ${layout}`}>
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
        />
        <div className={`grid ${content.grid || "three-grid"}`}>
          {items.map((item: any, i: number) => (
            <article key={i} className="service-card">
              <span className="icon-box">
                <Icon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.cta && (
                <a href={item.cta.url} className="card-cta">
                  {item.cta.label}
                </a>
              )}
              {item.planned && <span className="planned-badge">Planned</span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhySection({ section }: { section: PageSection }) {
  const { title, content } = section
  const items = content.items || []

  return (
    <section className="section why-section">
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
        />
        <div className="four-grid">
          {items.map((item: any, i: number) => (
            <article key={i} className="benefit-card">
              <span className="icon-box">
                <Icon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function TypesSection({ section }: { section: PageSection }) {
  const { title, content } = section
  const types = content.types || []

  return (
    <section className="section types-section">
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
        />
        <div className="types-grid">
          {types.map((type: any, i: number) => (
            <article key={i} className="type-card">
              <h3>{type.name}</h3>
              <p>{type.description}</p>
              {type.features && (
                <ul>
                  {type.features.map((f: string, j: number) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhoSection({ section }: { section: PageSection }) {
  const { title, content } = section

  return (
    <section className="section who-section">
      <div className="shell about-grid">
        <div>
          <SectionTitle kicker={content.kicker} title={title} />
          <p>{content.body}</p>
          {content.values && (
            <div className="value-panel">
              <h3>{content.values_title || "Values"}</h3>
              {content.values.map((v: string, i: number) => (
                <span key={i}>{v}</span>
              ))}
            </div>
          )}
        </div>
        {content.media && (
          <div className="who-media">
            <img src={content.media.url} alt={content.media.alt || title} />
          </div>
        )}
      </div>
    </section>
  )
}

function PackagesSection({ section }: { section: PageSection }) {
  const { title, content, layout } = section
  // This would fetch from Supabase or use content.packages
  const packages = content.packages || []

  return (
    <section className={`section packages-section ${layout}`}>
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
          centered={layout === "centered"}
        />
        <div className="package-grid">
          {packages.map((pkg: any, i: number) => (
            <SolarPackageCard key={i} item={pkg} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AddonsSection({ section }: { section: PageSection }) {
  const { title, content } = section
  const addons = content.addons || []

  return (
    <section className="section addons-section">
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
          centered
        />
        <div className="addons-grid">
          {addons.map((addon: any, i: number) => (
            <SolarAddonCard key={i} item={addon} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSection({ section }: { section: PageSection }) {
  const { title, content } = section
  const steps = content.steps || []

  return (
    <section className="section steps-section">
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
        />
        <div className="steps-grid">
          {steps.map((step: any, i: number) => (
            <article key={i} className="step-card">
              <span className="step-number">0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection({ section }: { section: PageSection }) {
  const { title, content } = section
  const features = content.features || []

  return (
    <section className="section features-section">
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
        />
        <div className="features-grid">
          {features.map((feature: any, i: number) => (
            <article key={i} className="feature-card">
              {feature.icon && <Icon name={feature.icon} size={28} />}
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection({ section }: { section: PageSection }) {
  const { content } = section
  const stats = content.stats || []

  return (
    <section className="section stats-section">
      <div className="shell">
        <div className="stats-grid">
          {stats.map((stat: any, i: number) => (
            <div key={i} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection({ section }: { section: PageSection }) {
  const { title, content } = section
  const testimonials = content.testimonials || []

  return (
    <section className="section testimonials-section">
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
          centered
        />
        <div className="testimonials-carousel">
          {testimonials.map((t: any, i: number) => (
            <blockquote key={i} className="testimonial-card">
              <p>"{t.quote}"</p>
              <footer>
                <cite>{t.author}</cite>
                {t.role && <span>{t.role}</span>}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ section }: { section: PageSection }) {
  const { title, content, layout } = section

  return (
    <section className={`section cta-section ${layout}`}>
      <div className="shell">
        <div className="cta-content">
          <h2>{title}</h2>
          {content.body && <p>{content.body}</p>}
          <div className="cta-actions">
            {content.cta_primary && (
              <a href={content.cta_primary.url} className="btn btn-primary">
                {content.cta_primary.label}
              </a>
            )}
            {content.cta_secondary && (
              <a href={content.cta_secondary.url} className="btn btn-secondary">
                {content.cta_secondary.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function TextSection({ section }: { section: PageSection }) {
  const { title, content } = section

  return (
    <section className="section text-section">
      <div className="shell">
        {title && <h2>{title}</h2>}
        <div
          className="text-content"
          dangerouslySetInnerHTML={{
            __html: content.body || content.html || "",
          }}
        />
      </div>
    </section>
  )
}

function RichTextSection({ section }: { section: PageSection }) {
  const { title, content } = section

  return (
    <section className="section richtext-section">
      <div className="shell">
        {title && <h2>{title}</h2>}
        <div
          className="richtext-content"
          dangerouslySetInnerHTML={{
            __html: content.html || content.body || "",
          }}
        />
      </div>
    </section>
  )
}

function ImageSection({ section }: { section: PageSection }) {
  const { title, content, layout } = section
  const image = content.image || content

  return (
    <section className={`section image-section ${layout}`}>
      <div className="shell">
        {title && <h2>{title}</h2>}
        <figure className="image-figure">
          <img src={image.url} alt={image.alt || title} />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      </div>
    </section>
  )
}

function GallerySection({ section }: { section: PageSection }) {
  const { title, content, layout } = section
  const images = content.images || []

  return (
    <section className={`section gallery-section ${layout}`}>
      <div className="shell">
        {title && <h2>{title}</h2>}
        <div className={`gallery-grid ${content.grid || ""}`}>
          {images.map((img: any, i: number) => (
            <figure key={i} className="gallery-item">
              <img src={img.url} alt={img.alt || `${title} ${i + 1}`} />
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function VideoSection({ section }: { section: PageSection }) {
  const { title, content } = section

  return (
    <section className="section video-section">
      <div className="shell">
        {title && <h2>{title}</h2>}
        <div className="video-wrapper">
          {content.embed_url && (
            <iframe
              src={content.embed_url}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {content.video_url && (
            <video controls poster={content.poster}>
              <source src={content.video_url} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </section>
  )
}

function FAQSectionRenderer({ section }: { section: PageSection }) {
  const { title, content } = section
  const faqs = content.faqs || []

  return (
    <section className="section faq-section">
      <div className="shell">
        <SectionTitle
          kicker={content.kicker}
          title={title}
          text={content.body}
          centered
        />
        <div className="faq-list">
          {faqs.map((faq: any, i: number) => (
            <details key={i} className="faq-item">
              <summary>{faq.question}</summary>
              <div className="faq-answer">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FormSection({ section }: { section: PageSection }) {
  const { title, content } = section
  const fields = content.fields || []

  return (
    <section className="section form-section">
      <div className="shell">
        {title && <h2>{title}</h2>}
        <form
          className="cms-form"
          action={content.action}
          method={content.method || "POST"}
        >
          {fields.map((field: any, i: number) => (
            <div key={i} className="form-field">
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                >
                  {field.options?.map((opt: any, j: number) => (
                    <option key={j} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  id={field.name}
                  name={field.name}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <button type="submit" className="btn btn-primary">
            {content.submit_label || "Submit"}
          </button>
        </form>
      </div>
    </section>
  )
}

function CalculatorSection({ section }: { section: PageSection }) {
  // This would embed the solar calculator component
  return (
    <section className="section calculator-section">
      <div className="shell">
        <h2>{section.title}</h2>
        <SolarCalculatorEmbed />
      </div>
    </section>
  )
}

function QuoteFormSection({ section }: { section: PageSection }) {
  return (
    <section className="section quote-form-section">
      <div className="shell">
        <h2>{section.title}</h2>
        <QuoteFormEmbed />
      </div>
    </section>
  )
}

function ContactSection({ section }: { section: PageSection }) {
  const { title, content } = section

  return (
    <section className="section contact-section">
      <div className="shell">
        {title && <h2>{title}</h2>}
        <div className="contact-grid">
          <ContactInfo info={content.info} />
          <ContactForm form={content.form} />
        </div>
      </div>
    </section>
  )
}

function MapSection({ section }: { section: PageSection }) {
  const { content } = section

  return (
    <section className="section map-section">
      <div className="shell">
        {content.embed_url && (
          <iframe
            src={content.embed_url}
            title="Location map"
            frameBorder="0"
            style={{ width: "100%", height: content.height || "400px" }}
            allowFullScreen
          />
        )}
      </div>
    </section>
  )
}

function SocialSection({ section }: { section: PageSection }) {
  const { content } = section
  const links = content.links || []

  return (
    <section className="section social-section">
      <div className="shell">
        <div className="social-links">
          {links.map((link: any, i: number) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection({ section }: { section: PageSection }) {
  const { title, content } = section

  return (
    <section className="section newsletter-section">
      <div className="shell">
        <h2>{title}</h2>
        <p>{content.body}</p>
        <form className="newsletter-form" action={content.action} method="POST">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
          />
          <button type="submit" className="btn btn-primary">
            {content.button_text || "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  )
}

function BreadcrumbSection({ section }: { section: PageSection }) {
  const { content } = section
  const items = content.items || []

  return (
    <nav className="breadcrumb-section" aria-label="Breadcrumb">
      <ol className="shell breadcrumb-list">
        {items.map((item: any, i: number) => (
          <li key={i} className="breadcrumb-item">
            {item.url && i < items.length - 1 ? (
              <a href={item.url}>{item.label}</a>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {i < items.length - 1 && <Icon name="chevron-right" size={16} />}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Generic fallback renderer
function GenericSection({ section }: { section: PageSection }) {
  const { title, content } = section

  return (
    <section
      className={`section generic-section section-${section.section_type}`}
    >
      <div className="shell">
        {title && <h2>{title}</h2>}
        <div className="generic-content">
          <pre>{JSON.stringify(content, null, 2)}</pre>
        </div>
      </div>
    </section>
  )
}

// Placeholder components for complex embeds
function SolarCalculatorEmbed() {
  return <div className="calculator-embed">[Solar Calculator Component]</div>
}

function QuoteFormEmbed() {
  return <div className="quote-form-embed">[Quote Form Component]</div>
}

function ContactInfo({ info }: { info: any }) {
  return (
    <div className="contact-info">
      {info?.phone && <p>📞 {info.phone}</p>}
      {info?.email && <p>✉️ {info.email}</p>}
      {info?.address && <p>📍 {info.address}</p>}
      {info?.hours && <p>🕐 {info.hours}</p>}
    </div>
  )
}

function ContactForm({ form }: { form: any }) {
  return (
    <form className="contact-form" action={form?.action} method="POST">
      <input type="text" name="name" placeholder="Your Name" required />
      <input type="email" name="email" placeholder="Your Email" required />
      <input type="tel" name="phone" placeholder="Your Phone" />
      <textarea name="message" placeholder="Your Message" required />
      <button type="submit" className="btn btn-primary">
        Send Message
      </button>
    </form>
  )
}
