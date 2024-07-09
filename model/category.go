package model

type Category struct {
	ID   int
	Name string
}

/* This function creates a new category struct instance and returns it populated with an ID and name. */
func NewCategory(name string) (*Category, error) {
	var nextID int
	err := DB.QueryRow("SELECT IFNULL(MAX(cat_id),0)+1 FROM categories").Scan(&nextID)
	if err != nil {
		return nil, err
	}
	return &Category{
		ID:   nextID,
		Name: name,
	}, nil
}

/* This function adds a new category to the table and returns in case of any database error. */
func (c *Category) Create() (err error) {
	stmt, err := DB.Prepare(`INSERT INTO categories (name) VALUES (:name)`)
	if err != nil {
		return
	}
	_, err = stmt.Exec(c.Name)
	return
}

/* This function gets the category from the database. Its main purpose is really just getting the category ID since the name is already given. */
func GetCategory(name string) (c *Category, err error) {
	c = &Category{}
	stmt, err := DB.Prepare(`SELECT * FROM categories WHERE name=?`)
	if err != nil {
		return
	}
	err = stmt.QueryRow(name).Scan(&c.ID, &c.Name)
	return
}

/* This function is for later use to change category name in case of typos, for admin usage. */
func (c *Category) ChangeName(newName string) (err error) {
	stmt, err := DB.Prepare(`UPDATE categories SET name=? where cat_id=?`)
	if err != nil {
		return
	}
	_, err = stmt.Exec(newName, c.ID)
	return
}

/* This function adds post and its category to the post_category table. */
func AddPostCategory(p Post, c Category) (err error) {
	stmt, err := DB.Prepare(`INSERT INTO post_category (post_id, cat_id) VALUES (?,?)`)
	if err != nil {
		return
	}
	_, err = stmt.Exec(p.ID, c.ID)
	return
}

func GetAllCategories() (allCategories []string, err error) {
	stmt, err := DB.Prepare(`SELECT name FROM categories`)
	if err != nil {
		return
	}

	rows, err := stmt.Query()
	for rows.Next() {
		var category string
		if err := rows.Scan(&category); err != nil {
			return nil, err
		}
		allCategories = append(allCategories, category)
	}

	if err != nil { // checking if there was an error while iterating on the result rows
		return
	}

	return
}
