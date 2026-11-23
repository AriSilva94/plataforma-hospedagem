import { redirect } from "next/navigation";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { PropertyWizard } from "@/components/owner/property-wizard";
import { getApiData } from "@/lib/server-api";
import { propertyDetailSchema, roomDetailSchema } from "@/lib/properties";
import { firstPendingStep, parseRoomCount, parseSetupStep } from "@/lib/setup-steps";

export default async function SetupPropertyPage({ params, searchParams }: PageProps<"/meus-imoveis/[propertyId]/configurar">) {
  const [{ propertyId }, { passo, quartos }] = await Promise.all([params, searchParams]);
  const result = await getApiData(`/owner/properties/${propertyId}`, propertyDetailSchema);

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref={`/meus-imoveis/${propertyId}/configurar`} />;
  }

  const property = result.data;
  if (property.status !== "DRAFT") redirect(`/meus-imoveis/${property.id}`);

  const roomResults = await Promise.all(property.rooms.map((room) => getApiData(`/owner/rooms/${room.id}`, roomDetailSchema)));
  const failedRoom = roomResults.find((room) => room.status !== "ok");
  if (failedRoom) {
    return <OwnerDataNotice status={failedRoom.status} retryHref={`/meus-imoveis/${property.id}/configurar`} />;
  }

  const rooms = roomResults.flatMap((room) => (room.status === "ok" ? [room.data] : []));
  const roomCount = parseRoomCount(quartos);
  const step = parseSetupStep(passo) ?? parseSetupStep(firstPendingStep(property.missingRequirements));

  return <PropertyWizard key={property.id} property={property} rooms={rooms} initialStep={step} initialRoomCount={roomCount} />;
}
