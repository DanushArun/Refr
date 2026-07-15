interface EndorserActivityFacts {
  acceptanceRate?: number;
  hires?: number;
  responseTime?: string;
}

interface EndorserIdentityFacts extends EndorserActivityFacts {
  companyName: string;
  jobTitle: string;
}

interface EndorserReasonFacts {
  companyName: string;
  name: string;
  skills: string[];
}

export function endorserActivityLine(facts: EndorserActivityFacts): string | null {
  const parts: string[] = [];
  if (facts.hires !== undefined) {
    parts.push(`${facts.hires} hire${facts.hires === 1 ? '' : 's'}`);
  }
  if (facts.responseTime) parts.push(`${facts.responseTime} reply`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function endorserAboutText(facts: EndorserIdentityFacts): string {
  const sentences = [`Works at ${facts.companyName} as ${facts.jobTitle}.`];
  if (facts.responseTime) sentences.push(`Typical response time is ${facts.responseTime}.`);
  if (facts.hires !== undefined) {
    sentences.push(`Has ${facts.hires} confirmed hire${facts.hires === 1 ? '' : 's'}.`);
  }
  if (facts.acceptanceRate !== undefined) {
    sentences.push(`Accepts ${facts.acceptanceRate}% of incoming requests.`);
  }
  return sentences.join(' ');
}

export function endorserReasonText(facts: EndorserReasonFacts): string {
  const firstName = facts.name.split(' ')[0];
  const skillSummary = facts.skills.slice(0, 2).join(' and ');
  if (!skillSummary) return `${firstName} works at ${facts.companyName}.`;
  return `${firstName} works at ${facts.companyName} and endorses for ${skillSummary}.`;
}
