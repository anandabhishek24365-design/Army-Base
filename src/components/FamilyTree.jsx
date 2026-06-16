import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, Heart, Shield, GraduationCap } from 'lucide-react';

export default function FamilyTree({ family }) {
  const [expandedNodes, setExpandedNodes] = useState({
    father: false,
    mother: false,
    wife: false,
    children: {}
  });

  const toggleNode = (relation, childIndex = null) => {
    if (childIndex !== null) {
      setExpandedNodes(prev => ({
        ...prev,
        children: {
          ...prev.children,
          [childIndex]: !prev.children[childIndex]
        }
      }));
    } else {
      setExpandedNodes(prev => ({
        ...prev,
        [relation]: !prev[relation]
      }));
    }
  };

  const renderRelativeCard = (relative, relation, isExpanded, onToggle) => {
    if (!relative) return (
      <div className="bg-military-black/40 border border-dashed border-army-green/40 p-4 rounded text-center text-xs text-olive-drab">
        No record registered for {relation}
      </div>
    );

    return (
      <div className="bg-military-black/80 border border-army-green/50 hover:border-tactical-gold/50 rounded transition-all duration-300 shadow-md">
        {/* Header Summary */}
        <div 
          onClick={onToggle}
          className="p-3 flex items-center justify-between cursor-pointer select-none hover:bg-army-green/10"
        >
          <div className="flex items-center gap-3">
            {relative.profilePicture ? (
              <img 
                src={relative.profilePicture} 
                alt={relative.name} 
                className="w-10 h-10 rounded-full object-cover border border-tactical-gold/35 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-army-green/50 flex items-center justify-center text-tactical-khaki border border-tactical-gold/30 shrink-0">
                <User size={18} />
              </div>
            )}
            <div>
              <div className="text-xs text-tactical-gold font-bold uppercase">{relation}</div>
              <div className="text-sm font-semibold text-white">{relative.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-olive-drab">
            <span className="text-[10px] bg-army-green/35 px-2 py-0.5 rounded text-tactical-khaki font-mono">AGE: {relative.age}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Expandable Body Details */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-army-green/20 text-xs font-mono text-tactical-khaki space-y-2 bg-army-dark/30 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[9px] text-olive-drab block uppercase font-sans">AADHAAR (MASKED)</span>
                <span className="flex items-center gap-1 font-bold text-slate-300">
                  <Shield size={10} className="text-tactical-gold" />
                  {relative.aadhaar || "XXXX-XXXX-XXXX"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-olive-drab block uppercase font-sans">BLOOD GROUP</span>
                <span className="font-bold text-red-400">{relative.bloodGroup || "N/A"}</span>
              </div>
              <div>
                <span className="text-[9px] text-olive-drab block uppercase font-sans">CONTACT NUMBER</span>
                <span className="text-white">{relative.contact || "N/A"}</span>
              </div>
              <div>
                <span className="text-[9px] text-olive-drab block uppercase font-sans">OCCUPATION</span>
                <span className="text-white">{relative.occupation || "N/A"}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-army-green/10 text-[11px]">
              <span className="text-[9px] text-olive-drab block uppercase font-sans">RESIDENTIAL ADDRESS</span>
              <span className="text-white font-sans">{relative.address || "Same as Permanent Address"}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full font-mono text-tactical-khaki py-6 relative">
      
      {/* TACTICAL TREE LAYOUT */}
      <div className="max-w-4xl mx-auto space-y-8 relative">
        
        {/* Layer 1: Parents (Father & Mother) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            {renderRelativeCard(family.father, "FATHER", expandedNodes.father, () => toggleNode('father'))}
          </div>
          <div className="relative">
            {renderRelativeCard(family.mother, "MOTHER", expandedNodes.mother, () => toggleNode('mother'))}
          </div>
        </div>

        {/* Separator / Connector Ring */}
        <div className="flex items-center justify-center h-4 no-print">
          <div className="w-[1px] h-full bg-tactical-gold/40 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-tactical-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
          </div>
        </div>

        {/* Layer 2: Spouse (Wife) */}
        <div className="max-w-md mx-auto relative">
          {renderRelativeCard(family.wife, "SPOUSE / WIFE", expandedNodes.wife, () => toggleNode('wife'))}
        </div>

        {/* Separator / Connector Ring */}
        {family.children && family.children.length > 0 && (
          <div className="flex items-center justify-center h-4 no-print">
            <div className="w-[1px] h-full bg-tactical-gold/40 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-tactical-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
            </div>
          </div>
        )}

        {/* Layer 3: Children Section */}
        {family.children && family.children.length > 0 && (
          <div className="border border-army-green/40 bg-army-dark/20 p-4 rounded-lg relative">
            <div className="absolute top-[-10px] left-4 bg-army-dark border border-army-green/50 px-2 py-0.5 rounded text-[9px] font-bold text-tactical-gold tracking-widest uppercase">
              REGISTERED DEPENDENT CHILDREN
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {family.children.map((child, index) => (
                <div key={index} className="bg-military-black/80 border border-army-green/50 hover:border-tactical-gold/50 rounded transition-all duration-300">
                  <div 
                    onClick={() => toggleNode('children', index)}
                    className="p-3 flex items-center justify-between cursor-pointer select-none hover:bg-army-green/10"
                  >
                    <div className="flex items-center gap-3">
                      {child.profilePicture ? (
                        <img 
                          src={child.profilePicture} 
                          alt={child.name} 
                          className="w-9 h-9 rounded-full object-cover border border-tactical-gold/30 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-army-green/40 flex items-center justify-center text-tactical-khaki border border-tactical-gold/20 shrink-0">
                          <Heart size={16} />
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] text-tactical-gold font-bold">CHILD #{index + 1}</div>
                        <div className="text-xs font-semibold text-white">{child.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-olive-drab">
                      <span className="text-[9px] bg-army-green/30 px-2 py-0.5 rounded text-tactical-khaki">AGE: {child.age}</span>
                      {expandedNodes.children[index] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {expandedNodes.children[index] && (
                    <div className="px-4 pb-4 pt-2 border-t border-army-green/20 text-[11px] font-mono text-tactical-khaki space-y-2 bg-army-dark/30 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-olive-drab block uppercase font-sans">DATE OF BIRTH</span>
                          <span className="text-white">{child.dob}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-olive-drab block uppercase font-sans">BLOOD GROUP</span>
                          <span className="font-bold text-red-400">{child.bloodGroup || "N/A"}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-army-green/10 flex items-start gap-1.5">
                        <GraduationCap size={14} className="text-tactical-gold shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] text-olive-drab block uppercase font-sans">EDUCATION STUDY</span>
                          <span className="text-white">{child.school}</span>
                          <span className="text-olive-drab text-[10px] block font-sans">Designation/Class: {child.class}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
