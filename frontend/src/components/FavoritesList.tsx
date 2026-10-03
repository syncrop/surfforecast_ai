import type { SpotWithLocation } from '../api/types';
import { compareTerritories, getTerritory } from '../lib/territory';

interface FavoritesListProps {
  allSpots: SpotWithLocation[];
  favoriteSlugs: string[];
  onSelectSpot: (spot: SpotWithLocation) => void;
  onToggleFavorite: (slug: string) => void;
}

export function FavoritesList({
  allSpots,
  favoriteSlugs,
  onSelectSpot,
  onToggleFavorite,
}: FavoritesListProps) {
  if (favoriteSlugs.length === 0) {
    return (
      <p className="empty-state">
        ☆ Aún no tienes spots favoritos. Pulsa la estrella en cualquier spot para guardarlo aquí.
      </p>
    );
  }

  const favorites = allSpots.filter((s) => favoriteSlugs.includes(s.slug));

  const byTerritory = new Map<string, SpotWithLocation[]>();
  for (const spot of favorites) {
    const territory = getTerritory(spot);
    const group = byTerritory.get(territory);
    if (group) {
      group.push(spot);
    } else {
      byTerritory.set(territory, [spot]);
    }
  }

  const territories = Array.from(byTerritory.keys()).sort(compareTerritories);

  return (
    <div className="favorites">
      {territories.map((territory) => (
        <section key={territory} className="favorites__group">
          <h3>{territory}</h3>
          <ul className="favorites__list">
            {byTerritory
              .get(territory)!
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((spot) => (
                <li key={spot.id} className="favorites__item">
                  <button
                    type="button"
                    className="favorites__star"
                    onClick={() => onToggleFavorite(spot.slug)}
                    aria-label={`Quitar ${spot.name} de favoritos`}
                    title="Quitar de favoritos"
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    className="favorites__spot"
                    onClick={() => onSelectSpot(spot)}
                  >
                    <span className="favorites__spot-name">{spot.name}</span>
                    <span className="favorites__spot-region">{spot.region}</span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
