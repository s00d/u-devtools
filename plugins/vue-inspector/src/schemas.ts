import { z } from 'zod';

/**
 * Zod schema for vue-inspector:getComponentState payload
 */
export const GetComponentStatePayloadSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

/**
 * Zod schema for vue-inspector:getPiniaTree payload
 */
export const GetPiniaTreePayloadSchema = z.object({
  filter: z.string().optional().default(''),
});

/**
 * Zod schema for vue-inspector:getPiniaState payload
 */
export const GetPiniaStatePayloadSchema = z.object({
  nodeId: z.string().min(1, 'nodeId is required'),
});

/**
 * Zod schema for vue-inspector:getTimelineEvents payload
 */
export const GetTimelineEventsPayloadSchema = z.object({
  layerId: z.string().optional(),
});
