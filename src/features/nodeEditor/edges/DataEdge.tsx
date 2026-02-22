import React, { useState } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

/**
 * Custom edge with data preview tooltip
 * Story 4-2: AC 4 - Hover displays data preview
 */
export const DataEdge: React.FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    source,
    target,
    sourceHandle,
    targetHandle,
    data,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Extract data type from edge data or source handle
    const dataType = data?.dataType || sourceHandle?.split('-')[1] || 'unknown';
    const sampleData = data?.sampleData || `${dataType} data`;

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    strokeWidth: 2,
                    stroke: '#10b981',
                    fill: 'none',
                }}
                className="hover:stroke-emerald-400 transition-colors cursor-pointer"
                d={edgePath}
                markerEnd={markerEnd}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
                <g>
                    <foreignObject
                        x={(sourceX + targetX) / 2 - 60}
                        y={(sourceY + targetY) / 2 - 30}
                        width="120"
                        height="60"
                        style={{ overflow: 'visible' }}
                    >
                        <div className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 shadow-lg z-50">
                            <div className="font-semibold text-emerald-400 mb-0.5">
                                {dataType}
                            </div>
                            <div className="text-zinc-400 truncate">
                                {String(sampleData)}
                            </div>
                        </div>
                    </foreignObject>
                </g>
            )}
        </>
    );
};
