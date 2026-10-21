interface OwidEmbedProps {
  slug: string
  title: string
  source: string
}

/** Live interactive chart from Our World in Data, with its own country selector and year range. */
export function OwidEmbed({ slug, title, source }: OwidEmbedProps) {
  return (
    <figure className="overflow-hidden rounded-[4px] bg-card">
      <div className="relative w-full" style={{ paddingTop: '62%' }}>
        <iframe
          className="absolute inset-0 h-full w-full bg-white"
          src={`https://ourworldindata.org/grapher/${slug}`}
          title={title}
          loading="lazy"
        />
      </div>
      <figcaption className="p-4">
        <p className="tracking-[-0.02em]">{title}</p>
        <p className="mt-1 text-xs text-white/45">{source}</p>
      </figcaption>
    </figure>
  )
}

interface YoutubeEmbedProps {
  videoId: string
  title: string
  credit: string
}

export function YoutubeEmbed({ videoId, title, credit }: YoutubeEmbedProps) {
  return (
    <figure className="overflow-hidden rounded-[4px] bg-card">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption className="p-4">
        <p className="tracking-[-0.02em]">{title}</p>
        <p className="mt-1 text-xs text-white/45">{credit}</p>
      </figcaption>
    </figure>
  )
}
