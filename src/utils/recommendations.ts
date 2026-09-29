import { AQICategory, RiskLevel } from '../types';

export interface ComprehensiveRecommendation {
  generalSummary: string;
  maskGuidance: {
    recommended: boolean;
    maskType: string;
    details: string;
  };
  outdoorActivities: {
    status: 'Safe' | 'Caution' | 'Restricted' | 'Prohibited';
    description: string;
  };
  sensitiveGroups: string[];
  indoorCare: string[];
  municipalMitigation: string[];
}

export function generateComprehensiveRecommendation(
  aqi: number,
  category: AQICategory,
  dominantPollutant: string,
  weatherRisk: RiskLevel
): ComprehensiveRecommendation {
  let outdoorStatus: 'Safe' | 'Caution' | 'Restricted' | 'Prohibited' = 'Safe';
  let maskRecommended = false;
  let maskType = 'None needed';
  let maskDetails = 'Ambient particulate levels are within clean air thresholds.';

  const sensitiveGroups: string[] = [];
  const indoorCare: string[] = [];
  const municipalMitigation: string[] = [];

  if (category === 'Good') {
    outdoorStatus = 'Safe';
    sensitiveGroups.push('No precautions required; ambient conditions optimal for all demographics.');
    indoorCare.push('Keep windows wide open for natural cross-ventilation.');
    indoorCare.push('Turn off mechanical purifiers to conserve energy.');
    municipalMitigation.push('Normal ambient monitoring routine active.');
  } else if (category === 'Satisfactory') {
    outdoorStatus = 'Safe';
    sensitiveGroups.push('Individuals with severe respiratory sensitivities should carry inhalers.');
    indoorCare.push('Good for regular ventilation during non-peak traffic hours.');
    municipalMitigation.push('Routine road sweeping with dust suppression.');
  } else if (category === 'Moderately Polluted') {
    outdoorStatus = 'Caution';
    maskRecommended = true;
    maskType = 'Cloth or Surgical Mask in traffic';
    maskDetails = `Elevated ${dominantPollutant} may cause coughing or throat irritation in congested corridors.`;
    sensitiveGroups.push('Asthma patients, COPD sufferers, children, and elderly should avoid prolonged heavy exertion outdoors.');
    sensitiveGroups.push('Take frequent breaks during outdoor sports.');
    indoorCare.push('Close street-facing windows during morning and evening rush hours.');
    indoorCare.push('Wipe dusty surfaces with damp cloths instead of dry sweeping.');
    municipalMitigation.push('Prioritize traffic signal synchronization to minimize idling at major junctions.');
  } else if (category === 'Poor') {
    outdoorStatus = 'Restricted';
    maskRecommended = true;
    maskType = 'N95 / FFP2 Respirator';
    maskDetails = 'Strictly recommended for pedestrians, two-wheeler riders, and traffic personnel.';
    sensitiveGroups.push('Heart and lung patients must eliminate all strenuous outdoor activity.');
    sensitiveGroups.push('Children should conduct school physical training in enclosed halls.');
    indoorCare.push('Seal drafty doors and run indoor air purifiers (HEPA standard).');
    indoorCare.push('Avoid indoor combustion, incense, or open frying without strong exhaust.');
    municipalMitigation.push('Deploy mechanical water mist cannons along arterial corridors to suppress resuspended dust.');
    municipalMitigation.push('Divert heavy diesel transport around residential bypass routes.');
  } else if (category === 'Very Poor') {
    outdoorStatus = 'Prohibited';
    maskRecommended = true;
    maskType = 'Tight-Fitting N95 / KN95 Mask';
    maskDetails = 'Mandatory for any necessary outdoor transit to filter hazardous fine particulates.';
    sensitiveGroups.push('High-risk alert: vulnerable persons should remain in air-filtered indoor spaces.');
    sensitiveGroups.push('Consult healthcare providers if experiencing shortness of breath or persistent cough.');
    indoorCare.push('Run air purifiers continuously on auto-boost mode.');
    indoorCare.push('Seal room vents and avoid opening balcony doors.');
    municipalMitigation.push('Temporary halt on uncontained construction excavation and stone crushing.');
    municipalMitigation.push('Strict enforcement of PUC norms and penalize visible smoke-emitting vehicles.');
  } else { // Severe
    outdoorStatus = 'Prohibited';
    maskRecommended = true;
    maskType = 'N95 / N99 Certified Respirator';
    maskDetails = 'Strict personal safety requirement; ambient air causes acute toxic stress to airways.';
    sensitiveGroups.push('Emergency health advisory: complete cessation of outdoor presence for all vulnerable citizens.');
    sensitiveGroups.push('Emergency medical hotlines on standby for respiratory distress.');
    indoorCare.push('Create a designated clean room with continuous HEPA filtration.');
    indoorCare.push('Do not perform vacuuming or any task that resuspends settled dust.');
    municipalMitigation.push('Emergency public health alert issued; recommend work-from-home advisory.');
    municipalMitigation.push('Intense high-pressure water sprinkling along all primary urban roads.');
  }

  // Weather risk modifier
  if (weatherRisk === 'High') {
    sensitiveGroups.push('Weather-Trap Alert: Calm winds and high humidity are preventing pollutant dispersion; localized stagnation is severe.');
    indoorCare.push('Postpone outdoor ventilation until afternoon sunshine enhances vertical thermal convection.');
  }

  return {
    generalSummary: `Current conditions fall into ${category} tier dominated by ${dominantPollutant}. ${outdoorStatus === 'Safe' ? 'No major lifestyle limitations required.' : 'Protective measures strongly advised.'}`,
    maskGuidance: {
      recommended: maskRecommended,
      maskType,
      details: maskDetails,
    },
    outdoorActivities: {
      status: outdoorStatus,
      description: outdoorStatus === 'Safe'
        ? 'Unrestricted outdoor exercises and sports permitted.'
        : outdoorStatus === 'Caution'
        ? 'Light recreation fine, but avoid strenuous high-cardio workouts along busy highways.'
        : outdoorStatus === 'Restricted'
        ? 'Relocate running, jogging, and cycling indoors.'
        : 'All outdoor athletic activities and recreational gatherings should be cancelled.',
    },
    sensitiveGroups,
    indoorCare,
    municipalMitigation,
  };
}
