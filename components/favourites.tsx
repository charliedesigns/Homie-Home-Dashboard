import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { DashItemProps } from "@/app/types";
import { X } from "lucide-react";

interface FavouritesProps {
  favourites: DashItemProps[];
  editMode: boolean;
  onRemove: (item: DashItemProps) => void;
}

const Favourites: React.FC<FavouritesProps> = ({
  favourites,
  editMode,
  onRemove,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: "favourites" });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-row gap-3 p-4 ${isOver ? "bg-gray-200" : ""}`}
    >
      {favourites.length > 0 ? (
        favourites.map((fav, index) => (
          <FavouriteItem
            key={index}
            item={fav}
            editMode={editMode}
            onRemove={onRemove}
          />
        ))
      ) : (
        <p>No favourites added yet.</p>
      )}
    </div>
  );
};

interface FavouriteItemProps {
  item: DashItemProps;
  editMode: boolean;
  onRemove: (item: DashItemProps) => void;
}

const FavouriteItem: React.FC<FavouriteItemProps> = ({
  item,
  editMode,
  onRemove,
}) => (
  <div className="relative">
    <Card className="p-10 rounded-3xl flex items-center justify-between">
      {item.name}
      {editMode && (
        <button
          onClick={() => onRemove(item)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Card>
  </div>
);

export default Favourites;
