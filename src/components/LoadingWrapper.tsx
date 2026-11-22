import { ReactNode } from "react"

interface LoadingWrapperProps {
  isLoading: boolean
  children: ReactNode
  skeletonCount?: number
  skeletonHeight?: string
  fallback?: ReactNode
}

export default function LoadingWrapper({
  isLoading,
  children,
  skeletonCount = 3,
  skeletonHeight = "200px",
  fallback,
}: LoadingWrapperProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="loading-wrapper" role="status" aria-label="Loading content">
      {fallback || (
        <div
          className="skeleton-grid"
          style={{
            gridTemplateRows: `repeat(${skeletonCount}, ${skeletonHeight})`,
          }}
        >
          {Array.from({ length: skeletonCount }, (_, i) => (
            <div key={i} className="skeleton-card">
              <div
                className="skeleton skeleton-image"
                style={{ height: "120px" }}
              />
              <div className="skeleton-lines">
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "60%" }}
                />
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "80%" }}
                />
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "40%" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
