interface StatPortraitCardProps {
  title: string;
  value: string;
  unit: string;
  image: string;
  description: string;
  onClick?: () => void;
}

export function StatPortraitCard({
  title,
  value,
  unit,
  image,
  description,
  onClick,
}: StatPortraitCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative h-[360px] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all"
    >
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Statistic Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow">
        <p className="text-2xl font-bold text-blue-900 leading-none">
          {value}
        </p>
        {unit && (
          <span className="text-xs font-semibold text-blue-700">
            {unit}
          </span>
        )}
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 p-6 text-white">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-white/80">
          {description}
        </p>
      </div>
    </div>
  );
}
