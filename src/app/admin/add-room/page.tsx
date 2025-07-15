
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, PackagePlus } from "lucide-react";
import { commonAmenities, universityAreas, addMockListing } from "@/packages/lib/mock-data"; 
import type { Amenity, UniversityArea, Listing } from "@/packages/types";
import { Separator } from "@/components/ui/separator";

const listingSchema = z.object({
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  description: z.string().min(20, { message: "A descrição deve ter pelo menos 20 caracteres." }),
  imageUrls: z.string().min(1, { message: "Pelo menos uma URL de imagem é obrigatória (separadas por vírgula)." })
    .transform(val => val.split(',').map(url => url.trim()).filter(url => url && z.string().url().safeParse(url).success))
    .refine(urls => urls.length > 0, {message: "Forneça URLs de imagem válidas."}),
  pricePerNight: z.coerce.number().positive({ message: "O preço deve ser um número positivo." }),
  address: z.string().min(10, { message: "O endereço deve ter pelo menos 10 caracteres." }),
  lat: z.coerce.number().min(-90, {message: "Latitude inválida."}).max(90, {message: "Latitude inválida."}),
  lng: z.coerce.number().min(-180, {message: "Longitude inválida."}).max(180, {message: "Longitude inválida."}),
  universityAcronym: z.string().min(1, { message: "Selecione uma universidade." }),
  guests: z.coerce.number().int().min(1, { message: "Pelo menos 1 hóspede." }),
  bedrooms: z.coerce.number().int().min(1, { message: "Pelo menos 1 quarto." }),
  beds: z.coerce.number().int().min(1, { message: "Pelo menos 1 cama." }),
  baths: z.coerce.number().int().min(1, { message: "Pelo menos 1 banheiro." }),
  selectedAmenityIds: z.array(z.string()).min(1, { message: "Selecione pelo menos uma comodidade." }),
  cancellationPolicy: z.string().min(10, { message: "A política de cancelamento deve ter pelo menos 10 caracteres." }),
  houseRules: z.string().min(10, { message: "As regras da casa devem ter pelo menos 10 caracteres." }),
  safetyAndProperty: z.string().min(10, { message: "As informações de segurança devem ter pelo menos 10 caracteres." }),
});

type ListingFormInputs = z.infer<typeof listingSchema>;

export default function AddRoomPage() {
  const { toast } = useToast();
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<ListingFormInputs>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrls: "",
      pricePerNight: 0,
      address: "",
      lat: 0,
      lng: 0,
      universityAcronym: "",
      guests: 1,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      selectedAmenityIds: [],
      cancellationPolicy: "Cancelamento flexível: Reembolso total até 5 dias antes do check-in.",
      houseRules: "Não são permitidas festas ou eventos.\nHorário de silêncio após as 22:00.\nNão fumar dentro do quarto ou áreas comuns.",
      safetyAndProperty: "Detector de fumaça instalado.\nExtintor de incêndio disponível.",
    },
  });

  const onSubmit: SubmitHandler<ListingFormInputs> = async (data) => {
    try {
      // In a real app, you'd send this to your backend
      // The addMockListing function expects a specific type, so we ensure data conforms to it.
      const listingDataForMock = {
        title: data.title,
        description: data.description,
        imageUrls: data.imageUrls, // This is already an array of strings from the transform
        pricePerNight: data.pricePerNight,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        guests: data.guests,
        bedrooms: data.bedrooms,
        beds: data.beds,
        baths: data.baths,
        selectedAmenityIds: data.selectedAmenityIds,
        universityAcronym: data.universityAcronym,
        cancellationPolicy: data.cancellationPolicy,
        houseRules: data.houseRules,
        safetyAndProperty: data.safetyAndProperty,
      };
      
      const addedListing = await addMockListing(listingDataForMock as Omit<Listing, 'id' | 'rating' | 'reviews' | 'host' | 'amenities' | 'images' | 'university'> & { imageUrls: string[], selectedAmenityIds: string[], universityAcronym: string, cancellationPolicy: string, houseRules: string, safetyAndProperty: string });

      toast({
        title: "Quarto Adicionado!",
        description: `O quarto "${addedListing.title}" foi adicionado com sucesso.`,
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });
      reset(); // Reset form fields
    } catch (error) {
      console.error("Falha ao adicionar quarto:", error);
      toast({
        title: "Erro ao Adicionar Quarto",
        description: "Não foi possível adicionar o quarto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <PackagePlus className="mr-3 h-8 w-8 text-primary" />
          Adicionar Novo Quarto
        </h1>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Detalhes do Quarto</CardTitle>
          <CardDescription>Preencha as informações abaixo para cadastrar um novo quarto na plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="title">Título do Anúncio</Label>
                <Input id="title" {...register("title")} placeholder="Ex: Quarto aconchegante perto da USP" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="pricePerNight">Preço por Mês (aprox.)</Label>
                <Input id="pricePerNight" type="number" {...register("pricePerNight")} placeholder="Ex: 950" />
                {errors.pricePerNight && <p className="text-xs text-destructive">{errors.pricePerNight.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Descrição Completa</Label>
              <Textarea id="description" {...register("description")} placeholder="Descreva o quarto, suas características, regras, etc." rows={4} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="imageUrls">URLs das Imagens (separadas por vírgula)</Label>
              <Textarea id="imageUrls" {...register("imageUrls")} placeholder="https://exemplo.com/img1.jpg, https://exemplo.com/img2.png" rows={2} />
              {errors.imageUrls && <p className="text-xs text-destructive">{errors.imageUrls.message as string}</p>}
            </div>

            {/* Location */}
            <Separator />
            <h3 className="text-lg font-medium text-foreground pt-2">Localização</h3>
            <div className="space-y-1">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input id="address" {...register("address")} placeholder="Rua Exemplo, 123, Bairro, Cidade - UF" />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" type="number" step="any" {...register("lat")} placeholder="-23.550520" />
                {errors.lat && <p className="text-xs text-destructive">{errors.lat.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lng">Longitude</Label>
                <Input id="lng" type="number" step="any" {...register("lng")} placeholder="-46.633308" />
                {errors.lng && <p className="text-xs text-destructive">{errors.lng.message}</p>}
              </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="universityAcronym">Próximo à Universidade</Label>
                <Controller
                  name="universityAcronym"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="universityAcronym">
                        <SelectValue placeholder="Selecione a universidade mais próxima" />
                      </SelectTrigger>
                      <SelectContent>
                        {universityAreas.map((uni: UniversityArea) => (
                          <SelectItem key={uni.acronym} value={uni.acronym}>
                            {uni.name} ({uni.acronym}) - {uni.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.universityAcronym && <p className="text-xs text-destructive">{errors.universityAcronym.message}</p>}
              </div>


            {/* Details */}
            <Separator />
            <h3 className="text-lg font-medium text-foreground pt-2">Detalhes do Quarto</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label htmlFor="guests">Máx. Hóspedes</Label>
                <Input id="guests" type="number" {...register("guests")} defaultValue={1} />
                {errors.guests && <p className="text-xs text-destructive">{errors.guests.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="bedrooms">Quartos</Label>
                <Input id="bedrooms" type="number" {...register("bedrooms")} defaultValue={1} />
                {errors.bedrooms && <p className="text-xs text-destructive">{errors.bedrooms.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="beds">Camas</Label>
                <Input id="beds" type="number" {...register("beds")} defaultValue={1} />
                {errors.beds && <p className="text-xs text-destructive">{errors.beds.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="baths">Banheiros</Label>
                <Input id="baths" type="number" {...register("baths")} defaultValue={1} />
                {errors.baths && <p className="text-xs text-destructive">{errors.baths.message}</p>}
              </div>
            </div>

            {/* Amenities */}
            <Separator />
            <h3 className="text-lg font-medium text-foreground pt-2">Comodidades</h3>
            <Controller
              name="selectedAmenityIds"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {commonAmenities.map((amenity: Amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity.id}`}
                        checked={field.value?.includes(amenity.id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...(field.value || []), amenity.id]
                            : (field.value || []).filter((id) => id !== amenity.id);
                          field.onChange(newValue);
                        }}
                      />
                      <Label htmlFor={`amenity-${amenity.id}`} className="font-normal cursor-pointer flex items-center">
                        <amenity.icon className="mr-2 h-4 w-4 text-muted-foreground" /> {amenity.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.selectedAmenityIds && <p className="text-xs text-destructive">{errors.selectedAmenityIds.message}</p>}
            
            {/* Additional Information */}
            <Separator />
            <h3 className="text-lg font-medium text-foreground pt-2">Informações Adicionais</h3>
            <div className="space-y-1">
              <Label htmlFor="cancellationPolicy">Política de Cancelamento</Label>
              <Textarea id="cancellationPolicy" {...register("cancellationPolicy")} placeholder="Detalhes sobre a política de cancelamento..." rows={3} />
              {errors.cancellationPolicy && <p className="text-xs text-destructive">{errors.cancellationPolicy.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="houseRules">Regras da Casa</Label>
              <Textarea id="houseRules" {...register("houseRules")} placeholder="Ex: Não fumar, não são permitidas festas..." rows={3} />
              {errors.houseRules && <p className="text-xs text-destructive">{errors.houseRules.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="safetyAndProperty">Segurança e Propriedade</Label>
              <Textarea id="safetyAndProperty" {...register("safetyAndProperty")} placeholder="Ex: Detector de fumaça, extintor..." rows={3} />
              {errors.safetyAndProperty && <p className="text-xs text-destructive">{errors.safetyAndProperty.message}</p>}
            </div>

            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Adicionando..." : "Adicionar Quarto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
