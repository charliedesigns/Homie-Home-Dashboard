"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Widget from "@/components/widgets";
import Favourites from "@/components/favourites";
import { DashItemProps } from "@/app/types";

const DashItem: React.FC<{
  id: string;
  name: string;
  url: string;
  imageurl?: string;
  editMode: boolean;
  onRemove: (id: string) => void;
}> = ({ id, name, url, imageurl, editMode, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, disabled: !editMode });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative"
    >
      <a
        href={editMode ? undefined : url}
        target={editMode ? undefined : "_blank"}
        rel={editMode ? undefined : "noopener noreferrer"}
        className="block"
        title={name}
        onClick={editMode ? (e) => e.preventDefault() : undefined}
      >
        <Card className="w-24 h-24 rounded-xl hover:shadow-lg transition-shadow duration-300 flex items-center justify-center">
          <CardContent className="p-0">
            {imageurl ? (
              <Image src={imageurl} width={64} height={64} alt={name} />
            ) : (
              <span>{name}</span>
            )}
          </CardContent>
        </Card>
      </a>
      {editMode && (
        <button
          onClick={() => onRemove(id)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const AddServiceDialog = ({
  onAddService,
}: {
  onAddService: (name: string, url: string, imageurl: string) => void;
}) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [imageurl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddService(name, url, imageurl);
    setName("");
    setUrl("");
    setImageUrl("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>
            Enter the details of the service you want to add to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageurl" className="text-right">
                Image URL
              </Label>
              <Input
                id="imageurl"
                value={imageurl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Service</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DashsetupDialog = ({
  onAddService,
}: {
  onAddService: (url: string) => void;
}) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddService(url);
    setUrl("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add your DashDot instance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dashdot setup</DialogTitle>
          <DialogDescription>
            Enter your address of dashdot + port (usually 8173)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Dashdot</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Home() {
  const [services, setServices] = useState<Array<DashItemProps>>([]);
  const [favourites, setFavourites] = useState<Array<DashItemProps>>([]);
  const [editMode, setEditMode] = useState(false);
  const [dashdotUrl, setDashdotUrl] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const savedServices = localStorage.getItem("services");
    const savedFavourites = localStorage.getItem("favourites");
    const savedDashdotUrl = localStorage.getItem("dashdotUrl");
    if (savedServices) setServices(JSON.parse(savedServices));
    if (savedFavourites) setFavourites(JSON.parse(savedFavourites));
    if (savedDashdotUrl) setDashdotUrl(savedDashdotUrl);
  }, []);

  useEffect(() => {
    localStorage.setItem("services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    if (dashdotUrl) {
      localStorage.setItem("dashdotUrl", dashdotUrl);
    }
  }, [dashdotUrl]);

  const addService = (name: string, url: string, imageurl: string) => {
    setServices([
      ...services,
      { id: `${name}-${Date.now()}`, name, url, imageurl },
    ]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id === "favourites") {
      const draggedItem = services.find((service) => service.id === active.id);
      if (draggedItem) {
        setFavourites([...favourites, draggedItem]);
        setServices(services.filter((service) => service.id !== active.id));
      }
    } else if (over && over.id === "apps") {
      const draggedItem = favourites.find((fav) => fav.id === active.id);
      if (draggedItem) {
        setServices([...services, draggedItem]);
        setFavourites(favourites.filter((fav) => fav.id !== active.id));
      }
    } else if (over && active.id !== over.id) {
      setFavourites((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const { setNodeRef: setAppsNodeRef } = useDroppable({ id: "apps" });

  const handleRemoveFavourite = (item: DashItemProps) => {
    setServices([...services, item]);
    setFavourites(favourites.filter((fav) => fav.id !== item.id));
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((service) => service.id !== id));
  };

  const handleDashdotSetup = (url: string) => {
    setDashdotUrl(url);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-5 px-80 py-5 dark">
        <div className="flex justify-between items-center">
          <h1 className="text-xl">Favourites</h1>
          <Button variant="outline" onClick={() => setEditMode(!editMode)}>
            {editMode ? "Save" : "Edit"}
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Favourites
            favourites={favourites}
            editMode={editMode}
            onRemove={handleRemoveFavourite}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl">Server Status</h1>
          {dashdotUrl ? (
            <Widget url={dashdotUrl} />
          ) : (
            <DashsetupDialog onAddService={handleDashdotSetup} />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h1 className="text-xl">Apps</h1>
            <AddServiceDialog onAddService={addService} />
          </div>
          <div
            ref={setAppsNodeRef}
            className="flex flex-row flex-wrap gap-3 p-4"
          >
            {services.map((service, index) => (
              <DashItem
                key={index}
                id={service.id}
                name={service.name}
                url={service.url}
                imageurl={service.imageurl}
                editMode={editMode}
                onRemove={handleRemoveService}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
