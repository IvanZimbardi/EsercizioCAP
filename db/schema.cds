namespace my.electronics;

entity Products {
  key ID : Integer;
  title : String;
  brand : String;
  stock : Integer;
  price : Decimal(10,2);
  category: Association to Categories
}

entity Categories {
  key ID : Integer;
  name : String;
  Products : Association to many Products on Products.category = $self;
}