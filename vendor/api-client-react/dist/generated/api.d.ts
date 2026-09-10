import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AstroReadingInput, ComboReadingInput, FaceReadingInput, HealthStatus, PalmReadingInput, Reading, ReadingStats, VoiceReadingInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListReadingsUrl: () => string;
/**
 * @summary List all readings, newest first
 */
export declare const listReadings: (options?: RequestInit) => Promise<Reading[]>;
export declare const getListReadingsQueryKey: () => readonly ["/api/readings"];
export declare const getListReadingsQueryOptions: <TData = Awaited<ReturnType<typeof listReadings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listReadings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listReadings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListReadingsQueryResult = NonNullable<Awaited<ReturnType<typeof listReadings>>>;
export type ListReadingsQueryError = ErrorType<unknown>;
/**
 * @summary List all readings, newest first
 */
export declare function useListReadings<TData = Awaited<ReturnType<typeof listReadings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listReadings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetReadingStatsUrl: () => string;
/**
 * @summary Summary stats about readings
 */
export declare const getReadingStats: (options?: RequestInit) => Promise<ReadingStats>;
export declare const getGetReadingStatsQueryKey: () => readonly ["/api/readings/stats"];
export declare const getGetReadingStatsQueryOptions: <TData = Awaited<ReturnType<typeof getReadingStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReadingStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReadingStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReadingStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getReadingStats>>>;
export type GetReadingStatsQueryError = ErrorType<unknown>;
/**
 * @summary Summary stats about readings
 */
export declare function useGetReadingStats<TData = Awaited<ReturnType<typeof getReadingStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReadingStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetReadingUrl: (id: number) => string;
/**
 * @summary Get a single reading
 */
export declare const getReading: (id: number, options?: RequestInit) => Promise<Reading>;
export declare const getGetReadingQueryKey: (id: number) => readonly [`/api/readings/${number}`];
export declare const getGetReadingQueryOptions: <TData = Awaited<ReturnType<typeof getReading>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReading>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReading>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReadingQueryResult = NonNullable<Awaited<ReturnType<typeof getReading>>>;
export type GetReadingQueryError = ErrorType<void>;
/**
 * @summary Get a single reading
 */
export declare function useGetReading<TData = Awaited<ReturnType<typeof getReading>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReading>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getDeleteReadingUrl: (id: number) => string;
/**
 * @summary Delete a reading
 */
export declare const deleteReading: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteReadingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteReading>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteReading>>, TError, {
    id: number;
}, TContext>;
export type DeleteReadingMutationResult = NonNullable<Awaited<ReturnType<typeof deleteReading>>>;
export type DeleteReadingMutationError = ErrorType<void>;
/**
* @summary Delete a reading
*/
export declare const useDeleteReading: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteReading>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteReading>>, TError, {
    id: number;
}, TContext>;
export declare const getCreateFaceReadingUrl: () => string;
/**
 * @summary Analyze a face photo and create a face reading with an archetype portrait
 */
export declare const createFaceReading: (faceReadingInput: FaceReadingInput, options?: RequestInit) => Promise<Reading>;
export declare const getCreateFaceReadingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFaceReading>>, TError, {
        data: BodyType<FaceReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFaceReading>>, TError, {
    data: BodyType<FaceReadingInput>;
}, TContext>;
export type CreateFaceReadingMutationResult = NonNullable<Awaited<ReturnType<typeof createFaceReading>>>;
export type CreateFaceReadingMutationBody = BodyType<FaceReadingInput>;
export type CreateFaceReadingMutationError = ErrorType<void>;
/**
* @summary Analyze a face photo and create a face reading with an archetype portrait
*/
export declare const useCreateFaceReading: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFaceReading>>, TError, {
        data: BodyType<FaceReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFaceReading>>, TError, {
    data: BodyType<FaceReadingInput>;
}, TContext>;
export declare const getCreatePalmReadingUrl: () => string;
/**
 * @summary Analyze a palm photo and create a palm reading
 */
export declare const createPalmReading: (palmReadingInput: PalmReadingInput, options?: RequestInit) => Promise<Reading>;
export declare const getCreatePalmReadingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPalmReading>>, TError, {
        data: BodyType<PalmReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPalmReading>>, TError, {
    data: BodyType<PalmReadingInput>;
}, TContext>;
export type CreatePalmReadingMutationResult = NonNullable<Awaited<ReturnType<typeof createPalmReading>>>;
export type CreatePalmReadingMutationBody = BodyType<PalmReadingInput>;
export type CreatePalmReadingMutationError = ErrorType<void>;
/**
* @summary Analyze a palm photo and create a palm reading
*/
export declare const useCreatePalmReading: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPalmReading>>, TError, {
        data: BodyType<PalmReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPalmReading>>, TError, {
    data: BodyType<PalmReadingInput>;
}, TContext>;
export declare const getCreateVoiceReadingUrl: () => string;
/**
 * @summary Transcribe a voice recording and create a conversation reading
 */
export declare const createVoiceReading: (voiceReadingInput: VoiceReadingInput, options?: RequestInit) => Promise<Reading>;
export declare const getCreateVoiceReadingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVoiceReading>>, TError, {
        data: BodyType<VoiceReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createVoiceReading>>, TError, {
    data: BodyType<VoiceReadingInput>;
}, TContext>;
export type CreateVoiceReadingMutationResult = NonNullable<Awaited<ReturnType<typeof createVoiceReading>>>;
export type CreateVoiceReadingMutationBody = BodyType<VoiceReadingInput>;
export type CreateVoiceReadingMutationError = ErrorType<void>;
/**
* @summary Transcribe a voice recording and create a conversation reading
*/
export declare const useCreateVoiceReading: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVoiceReading>>, TError, {
        data: BodyType<VoiceReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createVoiceReading>>, TError, {
    data: BodyType<VoiceReadingInput>;
}, TContext>;
export declare const getCreateComboReadingUrl: () => string;
/**
 * @summary Combined insight reading from any mix of face photo, birth details, and a recorded conversation, tailored to a context (job interview, business talk, relationship)
 */
export declare const createComboReading: (comboReadingInput: ComboReadingInput, options?: RequestInit) => Promise<Reading>;
export declare const getCreateComboReadingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComboReading>>, TError, {
        data: BodyType<ComboReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createComboReading>>, TError, {
    data: BodyType<ComboReadingInput>;
}, TContext>;
export type CreateComboReadingMutationResult = NonNullable<Awaited<ReturnType<typeof createComboReading>>>;
export type CreateComboReadingMutationBody = BodyType<ComboReadingInput>;
export type CreateComboReadingMutationError = ErrorType<void>;
/**
* @summary Combined insight reading from any mix of face photo, birth details, and a recorded conversation, tailored to a context (job interview, business talk, relationship)
*/
export declare const useCreateComboReading: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComboReading>>, TError, {
        data: BodyType<ComboReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createComboReading>>, TError, {
    data: BodyType<ComboReadingInput>;
}, TContext>;
export declare const getCreateAstroReadingUrl: () => string;
/**
 * @summary Create an astrology reading from birth date, time, and place, with daily lucky color, lucky number, and horoscope
 */
export declare const createAstroReading: (astroReadingInput: AstroReadingInput, options?: RequestInit) => Promise<Reading>;
export declare const getCreateAstroReadingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAstroReading>>, TError, {
        data: BodyType<AstroReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAstroReading>>, TError, {
    data: BodyType<AstroReadingInput>;
}, TContext>;
export type CreateAstroReadingMutationResult = NonNullable<Awaited<ReturnType<typeof createAstroReading>>>;
export type CreateAstroReadingMutationBody = BodyType<AstroReadingInput>;
export type CreateAstroReadingMutationError = ErrorType<void>;
/**
* @summary Create an astrology reading from birth date, time, and place, with daily lucky color, lucky number, and horoscope
*/
export declare const useCreateAstroReading: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAstroReading>>, TError, {
        data: BodyType<AstroReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAstroReading>>, TError, {
    data: BodyType<AstroReadingInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map