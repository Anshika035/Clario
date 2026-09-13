type OpportunityIdentityInput = {
  title: string;
  category: string;
  description: string;
  organization?: string;
};

export function normalizeOpportunityIdentityValue(value: string | undefined) {
  return value?.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim() ?? "";
}

export function areEquivalentOpportunityInputs(
  left: OpportunityIdentityInput,
  right: OpportunityIdentityInput,
) {
  const leftTitle = normalizeOpportunityIdentityValue(left.title);
  const rightTitle = normalizeOpportunityIdentityValue(right.title);
  const leftCategory = normalizeOpportunityIdentityValue(left.category);
  const rightCategory = normalizeOpportunityIdentityValue(right.category);
  const leftDescription = normalizeOpportunityIdentityValue(left.description);
  const rightDescription = normalizeOpportunityIdentityValue(right.description);
  const leftOrganization = normalizeOpportunityIdentityValue(left.organization);
  const rightOrganization = normalizeOpportunityIdentityValue(right.organization);

  if (
    leftTitle !== rightTitle ||
    leftCategory !== rightCategory ||
    leftDescription !== rightDescription
  ) {
    return false;
  }

  return (
    leftOrganization === rightOrganization ||
    leftOrganization === rightDescription ||
    rightOrganization === leftDescription
  );
}
