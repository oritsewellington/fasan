import Category from "../models/Category.model.js";
import Event from "../models/Event.model.js";

export async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort("group name").lean();

    const counts = await Event.aggregate([
      { $match: { categoryId: { $ne: null } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [c._id.toString(), c.count]),
    );

    res.json(
      categories.map((c) => ({
        ...c,
        eventCount: countMap[c._id.toString()] || 0,
      })),
    );
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found." });
    res.json(category);
  } catch (error) {
    console.error("Error in getCategory:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, group, emoji, description } = req.body;
    if (!name?.trim())
      return res.status(400).json({ message: "Category name is required." });
    if (!group?.trim())
      return res.status(400).json({ message: "Group is required." });

    const exists = await Category.findOne({ name: name.trim() }).collation({
      locale: "en",
      strength: 2,
    });
    if (exists)
      return res
        .status(409)
        .json({ message: "A category with this name already exists." });

    const category = await Category.create({
      name: name.trim(),
      group: group.trim(),
      emoji: emoji?.trim() || "🏆",
      description: description?.trim() || "",
      createdBy: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function updateCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found." });

    const { name, group, emoji, description } = req.body;

    if (name?.trim() && name.trim() !== category.name) {
      const exists = await Category.findOne({
        _id: { $ne: category._id },
        name: name.trim(),
      }).collation({ locale: "en", strength: 2 });
      if (exists)
        return res
          .status(409)
          .json({ message: "A category with this name already exists." });
      category.name = name.trim();
    }
    if (group?.trim()) category.group = group.trim();
    if (emoji?.trim()) category.emoji = emoji.trim();
    if (description !== undefined) category.description = description.trim();

    await category.save();

    await Event.updateMany(
      { categoryId: category._id },
      { category: category.name },
    );

    res.json(category);
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function deleteCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found." });

    const attachedCount = await Event.countDocuments({
      categoryId: category._id,
    });
    if (attachedCount > 0) {
      return res.status(409).json({
        message: `Can't delete — ${attachedCount} event${attachedCount === 1 ? " is" : "s are"} still using this category.`,
      });
    }

    await category.deleteOne();
    res.json({ message: "Category deleted." });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
