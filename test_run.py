from agenticrag.graph import create_agent
from langchain_core.messages import HumanMessage

def main():
    # 1. Compile the agent (which now has MemorySaver!)
    app = create_agent()
    
    # 2. We use a config with a thread_id. 
    # Any conversation with this thread_id will remember previous messages!
    config = {"configurable": {"thread_id": "user_123"}}
    
    print("--- FIRST QUESTION ---")
    question1 = "I ordered a laptop yesterday and I want to cancel it."
    print("User:", question1)
    
    # Pass the question inside the 'messages' list
    result1 = app.invoke(
        {"messages": [HumanMessage(content=question1)]},
        config=config
    )
    
    print("\nAgent Answer:", result1["messages"][-1].content)
    
    print("\n\n--- SECOND QUESTION (Testing Memory) ---")
    question2 = "Can I get a full refund for it?"
    print("User:", question2)
    
    # Notice we just send the new question, but we use the SAME thread_id!
    # The agent will remember that "it" refers to the laptop order from earlier.
    result2 = app.invoke(
        {"messages": [HumanMessage(content=question2)]},
        config=config
    )
    
    print("\nAgent Answer:", result2["messages"][-1].content)

if __name__ == "__main__":
    main()
