import React from 'react'

const Section = ({ title, children }) => (
  <div className="mb-3">
    <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      {children}
    </div>
  </div>
)

const Kpi = ({ label, value }) => (
  <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-3">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-xl font-bold text-gray-900">{value}</div>
  </div>
)

const PrintReport = ({ analytics, segmentData, regionData, kMeansClusters = [] }) => {
  const latestYear = analytics?.overview?.latestYear
  const avg = analytics?.overview?.avgHappiness?.slice(-1)[0]
  const regionsCount = Object.keys(analytics?.regions?.regions || {}).length
  const totalCountries = Object.values(analytics?.clusters?.buckets || {}).reduce((a,b)=>a+b,0)

  return (
    <div id="print-report" className="print-report bg-white text-gray-900" style={{ width: 794, margin: '0 auto', padding: 24 }}>
      {/* Timestamp */}
      <div className="flex justify-end mb-3">
        <div className="text-xs text-gray-600">Generated: {new Date().toLocaleString()}</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Kpi label="Latest Year" value={latestYear || '-'} />
        <Kpi label="Avg Happiness (Global)" value={avg?.toFixed ? avg.toFixed(2) : avg || '-'} />
        <Kpi label="Regions Covered" value={regionsCount} />
        <Kpi label="Countries Analyzed" value={totalCountries} />
      </div>

      {/* Yearly Trends summary */}
      <Section title="Yearly Trends (2015-2024)">
        <div className="text-sm text-gray-700 mb-2">
          Global average happiness has evolved from <span className="font-medium">{analytics?.overview?.avgHappiness?.[0]?.toFixed(2)}</span> ({analytics?.overview?.years?.[0]}) to <span className="font-medium">{avg?.toFixed ? avg.toFixed(2) : avg}</span> ({latestYear}).
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
          {analytics?.overview?.years?.map((yr, idx) => (
            <div key={yr} className="flex justify-between border-b border-gray-200 py-1">
              <span className="font-medium">{yr}</span>
              <span>{analytics?.overview?.avgHappiness?.[idx]?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Regional */}
      <Section title="Regional Average Happiness (As of 2024)">
        <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
          {regionData?.labels?.map((region, idx) => (
            <div key={region} className="flex justify-between items-center border-b border-gray-200 py-1">
              <span className="flex-1">{region}</span>
              <span className="font-medium">{regionData?.datasets?.[0]?.data?.[idx]?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Happiness Segments */}
      <Section title="Happiness Segments Distribution (As of 2024)">
        <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
          {segmentData?.labels?.map((label, idx) => (
            <div key={label} className="flex justify-between items-center border-b border-gray-200 pb-1">
              <div className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: segmentData?.datasets?.[0]?.backgroundColor?.[idx] }}></div>
                <span>{label}</span>
              </div>
              <span className="font-medium">{segmentData?.datasets?.[0]?.data?.[idx]} countries</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Spacer to push K-means to page 2 */}
      <div style={{ height: '150px' }}></div>

      {/* K-means Clusters - This will now be on Page 2 */}
      <Section title="K-means Clusters (As of 2024)">
        {kMeansClusters && kMeansClusters.length ? (
          <div className="space-y-1">
            {kMeansClusters.map((c) => (
              <div key={c.cluster_id} className="flex items-center justify-between border-b border-gray-200 py-1">
                <div className="font-medium text-gray-900 text-sm">{c.cluster_name}</div>
                <div className="text-xs text-gray-600">{c.size} countries</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600">No clusters yet.</div>
        )}
      </Section>
    </div>
  )
}

export default PrintReport
