from typing import Optional

from fastapi import APIRouter

router=APIRouter(tags=['blogs'])

# If blog_title is provided, then search for something more 
@router.get("/blogs")
def get_blogs(
    blog_title: Optional[str] = None 
):
    pass

@router.post("/blogs")
def create_blog():
    pass