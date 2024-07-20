import { ItemStack, Entity, EntityHealthComponent, EntityInventoryComponent, Player, world } from "@minecraft/server";

export default class Utilities {
  static ensureEntityComponent(entity: Entity, componentId: string) {
    if (!entity.hasComponent(componentId))
      throw Error(`Entity ${entity.typeId} does not have an EntityInventoryComponent`);
  }

  static getEntityInventoryComponent(entity: Entity): EntityInventoryComponent {
    let cId = EntityInventoryComponent.componentId;
    Utilities.ensureEntityComponent(entity, cId);
    return entity.getComponent(cId) as EntityInventoryComponent;
  }

  static getEntityHealthComponent(entity: Entity): EntityHealthComponent {
    let cId = EntityHealthComponent.componentId;
    Utilities.ensureEntityComponent(entity, cId);
    return entity.getComponent(cId) as EntityHealthComponent;
  }

  static giveItem(player: Player, item: string, itemName: string, id: string) {
    let inventoryContainer = Utilities.getEntityInventoryComponent(player).container
    let itemStack = new ItemStack(item, 1);
    if (!itemStack.isStackable) throw Error("Item ID can only be set on non-stackable items!")
    itemStack.nameTag = `§r§f${itemName}`;
    itemStack.setDynamicProperty(id, true);
    inventoryContainer.addItem(itemStack);
  }
}
