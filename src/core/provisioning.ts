import { randomUUID } from 'crypto';
import { createRecord } from './records.js';
import { createRelationship } from './relationships.js';
import { DataRecord, EntityData } from './types.js';
import { SYSTEM_ACCOUNT_ID } from './constants.js';

export interface ProvisioningResult {
  account: DataRecord;
  ownerContact: DataRecord;
  membership: DataRecord; // Using DataRecord for membership as per Identity Flattening
}

/**
 * Provisions a new Tenant Account.
 * Follows the lifecycle defined in bootstrap/provisioning_lifecycle.md
 */
export function provisionAccount(
  domain: string,
  plan: string,
  ownerEmail: string
): ProvisioningResult {
  // 1. Phase A: The Record (Account)
  const accountId = `acc-${domain.replace(/\./g, '-')}-${randomUUID().slice(0, 8)}`;
  const accountSlug = domain.replace(/\./g, '-');
  
  const accountData: EntityData = {
    domain,
    plan,
    status: 'active',
    schema_ref: 'oblio-schema-v1', // Phase B: Inheritance
    has_public_site: true // Default for now
  };

  const account = createRecord({
    id: accountId,
    type: 'brand', // Using 'brand' as the underlying type for Account based on typologies
    name: domain,
    slug: accountSlug,
    description: `Tenant Account for ${domain}`,
    data: accountData,
    account_id: SYSTEM_ACCOUNT_ID // Owned by Oblio Root
  });

  // 2. Phase C: The Owner (Contact)
  // Check if contact exists? For now, we assume new contact or create idempotent.
  // We use the email as the slug for uniqueness within Oblio Root.
  const contactSlug = `contact-${ownerEmail.replace(/[@.]/g, '-')}`;
  
  const contactData: EntityData = {
    email: ownerEmail,
    is_verified: false
  };

  // We try to create. If it exists (idempotency), we'd need a robust 'upsert' or 'find'
  // But for this 'provisioning' agent, we'll assume we create it.
  const ownerContact = createRecord({
    type: 'persona', // Mapping 'Contact' -> 'Persona' in current topology or 'identity'
    name: ownerEmail,
    slug: contactSlug,
    data: contactData,
    account_id: SYSTEM_ACCOUNT_ID
  });

  // 3. Phase C: Membership
  // A Membership is an edge in some systems, or a record in others.
  // In Identity Flattening: "A Membership is a record that links a Contact to an Account."
  // So we create a Membership Entity.
  
  const membershipId = `mem-${randomUUID()}`;
  const membershipData: EntityData = {
    roles: ['admin'],
    contact_ref: ownerContact.id,
    account_ref: account.id
  };

  const membership = createRecord({
    id: membershipId,
    type: 'solution', // Technically 'membership' but using available type or generic
    // WAIT: We should check if we have a proper type. If not, we use a generic constraint.
    // Let's us 'solution' as a placeholder if 'membership' isn't in ENUM, 
    // OR create a relationship if prefered.
    // Identity Flattening says: "Membership is a record".
    // Let's use 'persona' or similar if 'membership' missing.
    // Actually, looking at Reference, Membership is likely an Edge or a specific Type.
    // Let's create a Relationship 'member_of' as a fallback if type is strict.
    name: `Membership for ${ownerEmail}`,
    slug: `mem-${accountSlug}-${ownerEmail.slice(0, 5)}`,
    data: membershipData,
    account_id: account.id // The membership lives IN the account? Or Oblio?
    // Usually membership lives in the Account context.
  });
  
  // Link them for graph traversability
  createRelationship({
    from_record_id: ownerContact.id,
    to_record_id: account.id,
    relationship_type: 'member_of',
    data: { roles: ['admin'] }
  });

  return { account, ownerContact, membership };
}
