import type { BasesEntry, ViewRenderer, ViewTypeRegistration } from "../../types";
import type { FullSlug } from "@quartz-community/types";
import { i18n } from "../../i18n";
import { getColumnLabel, resolveEntryPropertyValue } from "../shared/cell";
import { groupEntries } from "../shared/group";
import { entryFilterValues } from "../shared/filter-chips";
import { transformLink } from "@quartz-community/utils";
import { resolveImageSrc } from "./cards";
import type { ResolveImageOpts } from "./cards";

function formatMessage(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  );
}

const GalleryView: ViewRenderer = ({
  entries,
  view,
  basesData,
  total,
  locale,
  slug,
  allSlugs,
  linkResolution,
}) => {
  const imageProperty = typeof view.image === "string" ? view.image : undefined;
  const localeStrings = i18n(locale).components.bases;
  const columns =
    typeof view.cardSize === "number" && view.cardSize > 0 ? Math.round(view.cardSize) : 3;
  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };
  const imageOpts: ResolveImageOpts = { slug, allSlugs, linkResolution };
  const transformOpts = { strategy: linkResolution, allSlugs: allSlugs as FullSlug[] };
  const groupProperty = view.groupBy?.property;
  const groupPropertyLabel = groupProperty ? getColumnLabel(groupProperty, basesData) : "";
  const groups = groupEntries(entries, groupProperty, localeStrings.uncategorized);
  const filterProperty = view.filterBy?.property;

  const renderGalleryItem = (entry: BasesEntry) => {
    const imageValue = imageProperty ? resolveEntryPropertyValue(imageProperty, entry) : undefined;
    const rawImage = imageValue ? String(imageValue) : "";
    const { src: imageSrc, isColor } = resolveImageSrc(rawImage, imageOpts);
    return (
      <div
        class="bases-gallery-item bases-entry"
        data-filter-values={filterProperty ? entryFilterValues(entry, filterProperty) : undefined}
      >
        <div class="bases-gallery-image">
          {imageSrc && !isColor ? (
            <img src={imageSrc} alt={entry.title} loading="lazy" />
          ) : imageSrc && isColor ? (
            <span class="bases-gallery-placeholder" style={{ background: imageSrc }} />
          ) : (
            <span class="bases-gallery-placeholder" role="img" aria-label={localeStrings.noImage} />
          )}
        </div>
        <div class="bases-gallery-title">
          <a
            href={transformLink(slug as FullSlug, entry.slug, transformOpts)}
            class="internal internal-link"
            data-slug={entry.slug}
          >
            {entry.title}
          </a>
        </div>
      </div>
    );
  };

  return (
    <div class="bases-gallery-wrapper">
      <div class="bases-view-meta">
        {formatMessage(localeStrings.showingCount, {
          count: entries.length,
          total,
        })}
      </div>
      {groups ? (
        Array.from(groups.entries()).map(([label, groupItems]) => (
          <div class="bases-group">
            <div class="bases-group-header">
              <span class="bases-group-title">
                {groupPropertyLabel && <span class="bases-group-property">{groupPropertyLabel} </span>}
                <span class="bases-group-label">{label}</span>
              </span>
              <span class="bases-group-count">{groupItems.length}</span>
            </div>
            <div class="bases-gallery" style={gridStyle}>
              {groupItems.map(renderGalleryItem)}
            </div>
          </div>
        ))
      ) : (
        <div class="bases-gallery" style={gridStyle}>
          {entries.map(renderGalleryItem)}
        </div>
      )}
    </div>
  );
};

export const galleryViewRegistration: ViewTypeRegistration = {
  id: "gallery",
  name: "Gallery",
  icon: "image",
  render: GalleryView,
};

export { GalleryView };
