import type { ZodTypeAny } from "zod";

export interface ContractDefinition<
  TRequest extends ZodTypeAny | undefined = ZodTypeAny | undefined,
  TResponse extends ZodTypeAny | undefined = ZodTypeAny | undefined
> {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  request?: TRequest;
  response?: TResponse;
}

export const defineContract = <
  TRequest extends ZodTypeAny | undefined,
  TResponse extends ZodTypeAny | undefined
>(
  contract: ContractDefinition<TRequest, TResponse>
) => contract;
